import express from "express";
import { supabase } from "../supabase";
import { isAdmin } from "../middleware/auth";
import { format, startOfMonth, endOfMonth } from "date-fns";

const router = express.Router();

router.get("/", isAdmin, async (req, res) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  try {
    // 1. Today's reservations (count children attending today)
    const { data: todaySchedules } = await supabase
      .from('program_schedules')
      .select('id')
      .eq('date', today);
    
    const scheduleIds = todaySchedules?.map(s => s.id) || [];
    
    const { count: todayCount } = scheduleIds.length > 0 
      ? await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .in('program_schedule_id', scheduleIds)
          .neq('status', 'cancelled')
      : { count: 0 };

    // 2. Monthly Revenue
    const { data: monthSchedules } = await supabase
      .from('program_schedules')
      .select('id')
      .gte('date', monthStart)
      .lte('date', monthEnd);
    
    const monthScheduleIds = monthSchedules?.map(s => s.id) || [];
    
    const { data: revenueData } = monthScheduleIds.length > 0
      ? await supabase
          .from('reservations')
          .select('total_price')
          .in('program_schedule_id', monthScheduleIds)
          .eq('status', 'confirmed')
      : { data: [] };
    
    const totalRevenue = (revenueData as any[])?.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0) || 0;

    const { count: activeCustCount } = await supabase
      .from('parents')
      .select('*', { count: 'exact', head: true })
      .eq('membership_status', 'active');

    const { count: pendingCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 3. LTV & Funnel Metrics (Strict Business Logic)
    const { data: allParents } = await supabase
      .from('parents')
      .select('id, name, membership_type, joined_at, membership_status');
    
    const { data: allConfirmedReservations } = await supabase
      .from('reservations')
      .select('parent_id, total_price, created_at')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true });

    const now = new Date();
    const CPA_ESTIMATE = 5000; // 顧客獲得単価（仮定）
    const ENROLLMENT_FEE = 10000; // 入会金（仮定）

    // 顧客ごとの集計
    const customerMetrics: Record<string, any> = {};
    (allParents as any[])?.forEach(p => {
      customerMetrics[p.id] = {
        parentId: p.id,
        parentName: p.name,
        membershipType: p.membership_type,
        joinedAt: p.joined_at ? new Date(p.joined_at) : null,
        reservations: [],
        totalRevenue: 0,
        spotRevenue: 0,
        memberRevenue: 0
      };
    });

    (allConfirmedReservations as any[])?.forEach(res => {
      const m = customerMetrics[res.parent_id];
      if (!m) return;

      const resDate = new Date(res.created_at);
      m.reservations.push(resDate);
      m.totalRevenue += (res.total_price || 0);

      // フェーズ別収益の分類
      if (m.membershipType === 'member' && m.joinedAt && resDate >= m.joinedAt) {
        m.memberRevenue += (res.total_price || 0);
      } else {
        m.spotRevenue += (res.total_price || 0);
      }
    });

    const processedLTVs = Object.values(customerMetrics).map((m: any) => {
      const count = m.reservations.length;
      let phase: 'trial' | 'visitor' | 'member' = 'trial';
      
      if (m.membershipType === 'member') {
        phase = 'member';
      } else if (count > 1) {
        phase = 'visitor';
      }

      // 離脱リスク計算: (現在 - 最終参加) > (平均間隔 * 1.5)
      let avgInterval = 0;
      if (count > 1) {
        const first = m.reservations[0].getTime();
        const last = m.reservations[count - 1].getTime();
        avgInterval = (last - first) / (count - 1) / (1000 * 60 * 60 * 24);
      }
      
      const daysSinceLast = count > 0 
        ? (now.getTime() - m.reservations[count - 1].getTime()) / (1000 * 60 * 60 * 24)
        : 999;
      
      const isChurnRisk = count > 1 && daysSinceLast > (avgInterval * 1.5) && daysSinceLast > 30;

      return {
        parentId: m.parentId,
        parentName: m.parentName,
        phase,
        participationCount: count,
        averageIntervalDays: Math.round(avgInterval),
        firstParticipationDate: count > 0 ? format(m.reservations[0], 'yyyy-MM-dd') : 'なし',
        lastParticipationDate: count > 0 ? format(m.reservations[count - 1], 'yyyy-MM-dd') : 'なし',
        isChurnRisk,
        spotRevenue: m.spotRevenue,
        totalRevenue: m.totalRevenue + (m.membershipType === 'member' ? ENROLLMENT_FEE : 0),
        // Include fields needed for magic number calculation
        membershipType: m.membershipType,
        reservations: m.reservations,
        joinedAt: m.joinedAt
      };
    });

    // A. フェーズ別平均LTV
    const phaseStats = {
      trial: { total: 0, count: 0 },
      visitor: { total: 0, count: 0 },
      member: { total: 0, count: 0 }
    };
    processedLTVs.forEach(c => {
      phaseStats[c.phase].total += c.totalRevenue;
      phaseStats[c.phase].count += 1;
    });

    const avgPhaseLTV = {
      trial: phaseStats.trial.count ? Math.round(phaseStats.trial.total / phaseStats.trial.count) : 0,
      visitor: phaseStats.visitor.count ? Math.round(phaseStats.visitor.total / phaseStats.visitor.count) : 0,
      member: phaseStats.member.count ? Math.round(phaseStats.member.total / phaseStats.member.count) : 0,
    };

    // B. マジックナンバー分析 (入会前の参加回数分布)
    // 「n回参加した時点での入会率」を算出
    const magicNumberMap: Record<number, { total: number, enrolled: number }> = {};
    for (let i = 1; i <= 5; i++) magicNumberMap[i] = { total: 0, enrolled: 0 };

    processedLTVs.forEach(c => {
      if (c.membershipType === 'member') {
        // 入会者は「入会前に何回参加したか」をカウント（簡易的にjoinedAt以前の予約数）
        const preEnrollmentCount = c.reservations.filter((d: Date) => d < c.joinedAt).length;
        if (preEnrollmentCount > 0 && preEnrollmentCount <= 5) {
          for (let i = preEnrollmentCount; i <= 5; i++) {
            magicNumberMap[i].total++;
            magicNumberMap[i].enrolled++;
          }
        }
      } else {
        // 非会員は現在の参加回数までを「未入会」としてカウント
        const count = Math.min(c.participationCount, 5);
        for (let i = 1; i <= count; i++) {
          magicNumberMap[i].total++;
        }
      }
    });

    const magicNumberData = Object.entries(magicNumberMap).map(([n, data]) => ({
      participations: parseInt(n),
      enrollmentRate: data.total > 0 ? Math.round((data.enrolled / data.total) * 100) : 0
    }));

    // C. アラートリスト
    const enrollmentPushList = processedLTVs.filter(c => c.phase === 'visitor' && c.spotRevenue >= ENROLLMENT_FEE);
    const churnRiskList = processedLTVs.filter(c => c.isChurnRisk && c.phase === 'member');
    const milestoneList = processedLTVs.filter(c => [10, 30, 50, 100].includes(c.participationCount));

    // Mock chart data
    const chartRevenueData = [
      { name: 'Week 1', value: 45000 },
      { name: 'Week 2', value: 52000 },
      { name: 'Week 3', value: 48000 },
      { name: 'Week 4', value: 61000 },
    ];

    res.json({
      todayReservations: todayCount || 0,
      monthlyRevenue: totalRevenue,
      activeCustomers: activeCustCount || 0,
      pendingRequests: pendingCount || 0,
      revenueData: chartRevenueData,
      phaseLTV: avgPhaseLTV,
      phaseCounts: {
        trial: phaseStats.trial.count,
        visitor: phaseStats.visitor.count,
        member: phaseStats.member.count
      },
      conversionRates: {
        trialToVisitor: Math.round((phaseStats.visitor.count + phaseStats.member.count) / (processedLTVs.length || 1) * 100),
        visitorToMember: Math.round(phaseStats.member.count / (phaseStats.visitor.count + phaseStats.member.count || 1) * 100)
      },
      retentionRate: Math.round(processedLTVs.filter(c => c.participationCount > 1).length / (processedLTVs.length || 1) * 100),
      averageLTV: Math.round(processedLTVs.reduce((acc, curr) => acc + curr.totalRevenue, 0) / (processedLTVs.length || 1)),
      topCustomers: processedLTVs.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10),
      enrollmentPushList,
      churnRiskList,
      milestoneList,
      magicNumberData
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
