import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  Mail,
  History,
  Award,
  Coins,
  ArrowUpDown,
  LogOut,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { createClient } from "@supabase/supabase-js";

// --- Database/API Alignment Types ---
type TierDetails = {
  id: string;
  name: string;
  min_points: number;
  badge_color: string;
  description: string;
  reward_interval: number | null;
  points_multiplier: number;
  discount_percentage: number;
};

type LoyaltySummary = {
  member_id: string;
  current_tier: TierDetails | null;
  next_tier: TierDetails | null;
  points_to_next_tier: number;
  total_earned_points: number;
};

type PointTransaction = {
  loyalty_point_id: string;
  points: number;
  transaction_type: "EARN" | "REDEEM" | "EXPIRE";
  description: string;
  earned_at: string;
  expires_at: string | null;
  booking_id: string;
  days_remaining: number | null;
};

type PointTransactionResponse = {
  limit: number;
  offset: number;
  member_id: string;
  total_count: number;
  transactions: PointTransaction[];
};

type MemberProfile = {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  date_of_birth?: string;
  auth_user_id: string;
  is_active: boolean;
  joined_at: string;
  updated_at: string;
  total_earned_points: number;
};

type BookingSlotDetails = {
  slot: {
    id: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
  };
  field: {
    id: string;
    name: string;
    size: string;
    icon_url: string;
    player_capacity: number;
  };
  shift: {
    id: string;
    name: string;
  };
  slot_price: number;
  booking_date: string;
  booking_slot_id: string;
};

type Booking = {
  booking_id: string;
  booking_code: string;
  booked_at: string;
  updated_at: string;
  status: "confirmed" | "pending" | "cancelled";
  guest: {
    full_name: string;
    email: string;
    phone_number: string;
    number_of_players: number;
    special_notes: string;
  };
  slots: BookingSlotDetails[];
  loyalty: {
    transactions: Array<{
      points: number;
      created_at: string;
      description: string;
      loyalty_point_id: string;
      transaction_type: "EARN" | "REDEEM";
    }>;
    points_earned: number;
    points_redeemed: number;
  };
  payment: {
    method: string;
    status: string;
    total_amount: number;
    discount_amount: number;
    final_amount: number;
    paid_amount: number;
    due_amount: number;
  };
  discount: {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
  } | null;
};

type ApiClient = {
  get_member_by_auth_user_id: (
    authUserId: string,
  ) => Promise<MemberProfile | null>;
  get_member_booking_history: (
    memberId: string,
  ) => Promise<{ bookings: Booking[] }>;
  get_membership_tier_list: () => Promise<TierDetails[]>;
  get_usable_points: (
    memberId: string,
  ) => Promise<Array<{ total_useable_points: number }>>;
  get_member_point_transactions: (
    memberId: string,
  ) => Promise<PointTransactionResponse | null | any>;
};

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://your-supabase-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const api: ApiClient = {
  get_member_by_auth_user_id: async (authUserId: string) => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      console.error("Error looking up member context:", error);
      return null;
    }
    return data;
  },

  get_member_booking_history: async (memberId: string) => {
    const { data, error } = await supabase.rpc("get_member_booking_history", {
      p_member_id: memberId,
    });

    if (error) {
      console.error("Error retrieving booking records via RPC:", error);
      return { bookings: [] };
    }
    return data;
  },

  get_membership_tier_list: async () => {
    const { data, error } = await supabase.from("membership_tiers").select("*");

    if (error) {
      console.error("Error evaluating milestone ranges:", error);
      return [];
    }
    return data || [];
  },

  get_usable_points: async (memberId: string) => {
    const { data, error } = await supabase.rpc("get_usable_points", {
      p_member_id: memberId,
    });

    if (error) {
      console.error("Error querying point summary balance via RPC:", error);
      return [{ total_useable_points: 0 }];
    }
    return data;
  },

  get_member_point_transactions: async (memberId: string) => {
    const { data, error } = await supabase.rpc(
      "get_member_point_transactions",
      {
        p_member_id: memberId,
        p_limit: 20,
        p_offset: 0,
      },
    );

    if (error) {
      console.error(
        "Error hydrating point transaction data matrix via RPC:",
        error,
      );
      return null;
    }
    return data;
  },
};

type ExtendedUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
};

type UserProfileProps = {
  currentUser: ExtendedUser | null;
  onLogout: () => void;
};

export function UserProfile({ currentUser, onLogout }: UserProfileProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);
  const [allTiers, setAllTiers] = useState<TierDetails[]>([]);
  const [usablePoints, setUsablePoints] = useState<number>(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentUser) return;
      try {
        setLoading(true);

        const memberProfile = await api.get_member_by_auth_user_id(
          currentUser.id,
        );
        setProfile(memberProfile);

        const memberId = memberProfile ? memberProfile.id : currentUser.id;

        const [bookingRes, tierList, pointsRes, transactionRes] =
          await Promise.all([
            api.get_member_booking_history(memberId),
            api.get_membership_tier_list(),
            api.get_usable_points(memberId),
            api.get_member_point_transactions(memberId),
          ]);

        // Guard Check: Extract Array metrics from Supabase RPC structures safely
        let txArray: PointTransaction[] = [];
        if (transactionRes) {
          if (Array.isArray(transactionRes)) {
            txArray = transactionRes;
          } else if (
            transactionRes.transactions &&
            Array.isArray(transactionRes.transactions)
          ) {
            txArray = transactionRes.transactions;
          }
        }
        setTransactions(txArray);

        const extractedBookings = bookingRes?.bookings || [];
        const sortedBookings = [...extractedBookings].sort(
          (a, b) =>
            new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime(),
        );
        setBookings(sortedBookings);

        const currentPointsBalance = pointsRes?.[0]?.total_useable_points || 0;
        setUsablePoints(currentPointsBalance);

        const totalAccumulated = memberProfile?.total_earned_points || 0;
        const sortedTiers = [...tierList].sort(
          (a, b) => a.min_points - b.min_points,
        );
        setAllTiers(sortedTiers);

        let currentTier: TierDetails | null = null;
        let nextTier: TierDetails | null = null;

        for (let i = 0; i < sortedTiers.length; i++) {
          if (totalAccumulated >= sortedTiers[i].min_points) {
            currentTier = sortedTiers[i];
            nextTier = sortedTiers[i + 1] || null;
          }
        }

        if (!currentTier && sortedTiers.length > 0) {
          nextTier = sortedTiers[0];
        }

        setLoyalty({
          member_id: memberId,
          current_tier: currentTier,
          next_tier: nextTier,
          points_to_next_tier: nextTier
            ? Math.max(0, nextTier.min_points - totalAccumulated)
            : 0,
          total_earned_points: totalAccumulated,
        });
      } catch (error) {
        console.error("Failed to aggregate dashboard metrics payload:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 font-medium">
          Please log in to view your profile ecosystem.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500 animate-pulse font-medium">
          Syncing secure tier allocations and updates...
        </p>
      </div>
    );
  }

  const totalInvestedAmount = bookings.reduce(
    (sum, b) => sum + (b.payment?.final_amount || 0),
    0,
  );

  const totalEarned = loyalty?.total_earned_points || 0;
  const currentTierMin = loyalty?.current_tier?.min_points || 0;
  const nextTierMin = loyalty?.next_tier?.min_points || totalEarned;
  const tierRange = nextTierMin - currentTierMin;
  const progressPercent =
    tierRange > 0
      ? Math.min(
          100,
          Math.max(0, ((totalEarned - currentTierMin) / tierRange) * 100),
        )
      : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Identity and Point Summary Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Identity Card */}
        <Card className="md:col-span-1 shadow-sm border-gray-100 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <UserIcon className="w-5 h-5 text-green-600" />
              Member Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center border border-green-100 shadow-sm">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">
                    {profile ? profile.full_name : currentUser.name}
                  </p>
                  {loyalty?.current_tier ? (
                    <Badge
                      variant="outline"
                      className="mt-1 font-semibold border border-transparent shadow-sm text-white capitalize px-2.5 py-0.5"
                      style={{
                        backgroundColor: loyalty.current_tier.badge_color,
                      }}
                    >
                      {loyalty.current_tier.name} Tier
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="mt-1 font-semibold text-gray-600 capitalize px-2.5 py-0.5"
                    >
                      Rookie Tier
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100 text-gray-600">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium">
                    {profile ? profile.phone_number : currentUser.phone}
                  </span>
                </div>
                {(profile?.email || currentUser.email) && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">
                      {profile ? profile.email : currentUser.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <Button
                variant="outline"
                onClick={onLogout}
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                Log Out Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Rewards Engine Status */}
        <Card className="md:col-span-2 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Award className="w-5 h-5 text-yellow-500" />
              Loyalty Rewards Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Balance Box */}
              <div className="flex flex-col justify-between p-5 bg-gradient-to-br from-green-50/60 to-emerald-50/60 rounded-xl border border-green-100/70 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Usable Point Balance
                    </p>
                    <h3 className="text-4xl font-extrabold text-emerald-900 mt-1">
                      {usablePoints}
                    </h3>
                  </div>
                  <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-sm">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-medium text-emerald-700 mt-4 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Active point tokens
                  usable during checkouts.
                </p>
              </div>

              {/* Progress Box */}
              <div className="flex flex-col justify-between p-5 bg-gradient-to-br from-amber-50/60 to-orange-50/60 rounded-xl border border-amber-100/70 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Accumulated Vault
                    </p>
                    <h3 className="text-2xl font-bold text-amber-950 mt-1">
                      {totalEarned} Lifetime Points
                    </h3>
                  </div>
                  <div className="p-2 bg-amber-500 rounded-xl text-white shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {loyalty && loyalty.next_tier ? (
                    <div className="space-y-1.5">
                      <p className="text-xs text-amber-900 font-medium">
                        Earn{" "}
                        <span className="font-extrabold text-orange-700">
                          {loyalty.points_to_next_tier}
                        </span>{" "}
                        more points for{" "}
                        <span className="font-bold text-amber-950 capitalize">
                          {loyalty.next_tier.name}
                        </span>{" "}
                        status
                      </p>
                      <Progress
                        value={progressPercent}
                        className="h-2 bg-amber-200/60 [&>div]:bg-amber-600"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-amber-900 font-bold flex items-center gap-1">
                      🎉 Maximum Elite Status Tier Level Achieved
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Snapshot Analytical Numeric Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-black text-green-600 mb-0.5">
              {bookings.length}
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Reservations
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-black text-green-600 mb-0.5">
              ৳{totalInvestedAmount.toLocaleString()}
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Capital Invested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tab Interfaces */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="bookings"
            className="gap-2 font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <History className="w-4 h-4" />
            Booking Records
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="gap-2 font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ArrowUpDown className="w-4 h-4" />
            Milestones & Logs
          </TabsTrigger>
        </TabsList>

        {/* Bookings View Module */}
        <TabsContent value="bookings" className="focus-visible:outline-none">
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                <History className="w-4 h-4 text-green-600" /> Historical and
                Active Reservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-semibold">
                    No reservations found matching profile indices
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const dynamicSlot = booking.slots?.[0];
                    const fieldName =
                      dynamicSlot?.field?.name || "Sports Field Arena";
                    const bookingDateString =
                      dynamicSlot?.booking_date || booking.booked_at;

                    const parsedDate = new Date(bookingDateString);
                    const isDateClean = isValid(parsedDate);
                    const isPast = isDateClean
                      ? parsedDate < new Date()
                      : false;

                    return (
                      <div
                        key={booking.booking_id}
                        className="border border-gray-100 rounded-xl p-4 space-y-3 hover:border-green-200 transition-all bg-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-base">
                              {fieldName}
                            </span>
                            <Badge
                              variant={isPast ? "secondary" : "default"}
                              className="font-semibold text-xs shrink-0"
                            >
                              {booking.status || "Confirmed"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="font-mono text-[11px] bg-gray-50 text-gray-600 font-semibold border-gray-200"
                            >
                              {booking.booking_code}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {isDateClean
                                  ? format(parsedDate, "PPP")
                                  : "Date Unavailable"}
                              </span>
                            </div>
                            {dynamicSlot?.slot && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span>
                                  {dynamicSlot.slot.start_time} -{" "}
                                  {dynamicSlot.slot.end_time} (
                                  {dynamicSlot.slot.duration_minutes} mins)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex flex-row sm:flex-col justify-between items-center sm:items-end gap-1 shrink-0">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            Payment Metric
                          </p>
                          <div className="text-right">
                            <span className="text-base font-black text-gray-900">
                              ৳
                              {(
                                booking.payment?.final_amount || 0
                              ).toLocaleString()}
                            </span>
                            <span className="text-[10px] block text-gray-400 font-medium font-mono capitalize">
                              {booking.payment?.method || "bkash"} transaction
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Milestone Horizontal Roadmap Track & Ledger Records */}
        <TabsContent
          value="transactions"
          className="focus-visible:outline-none space-y-6"
        >
          {/* TIER ROADMAP COMPONENT - HORIZONTAL TRACK WITH SCROLL SNAPPING */}
          <Card className="shadow-sm border-gray-100 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Loyalty Tier
                  Roadmap
                </CardTitle>
                <p className="text-[11px] text-gray-400 font-medium">
                  Scroll horizontally to view upcoming elite status benefits
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 sm:flex hidden"
              >
                Swipe Track →
              </Badge>
            </CardHeader>
            <CardContent className="p-0 relative">
              {allTiers.length === 0 ? (
                <div className="p-6 text-xs text-gray-400 italic text-center">
                  No structural progression tiers mapped.
                </div>
              ) : (
                <div className="relative w-full">
                  {/* Horizontal Scroll Track */}
                  <div className="flex items-stretch gap-6 overflow-x-auto overflow-y-hidden pb-6 pt-8 px-6 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {allTiers.map((tier, index) => {
                      const isAchieved = totalEarned >= tier.min_points;
                      const isCurrent = loyalty?.current_tier?.id === tier.id;

                      return (
                        <div
                          key={tier.id || index}
                          className={`flex-none w-[240px] snap-start relative bg-white border border-gray-100 rounded-xl p-5 transition-all shadow-sm flex flex-col justify-between group ${
                            isCurrent
                              ? "ring-2 ring-offset-2"
                              : "hover:border-gray-200"
                          }`}
                          style={{
                            borderColor: isCurrent
                              ? tier.badge_color
                              : undefined,
                          }}
                        >
                          {/* Inter-node Connecting Line */}
                          {index < allTiers.length - 1 && (
                            <div className="absolute top-10 left-[calc(100%-12px)] w-[40px] h-0.5 bg-gray-100 group-hover:bg-gray-200 transition-colors z-0 pointer-events-none" />
                          )}

                          <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 bg-white shadow-sm text-sm font-bold transition-all"
                                style={{
                                  borderColor: isAchieved
                                    ? tier.badge_color
                                    : "#E5E7EB",
                                  color: isAchieved
                                    ? tier.badge_color
                                    : "#9CA3AF",
                                }}
                              >
                                {isAchieved ? (
                                  <CheckCircle2
                                    className="w-5 h-5 fill-current text-white"
                                    style={{ color: tier.badge_color }}
                                  />
                                ) : (
                                  <span>{index + 1}</span>
                                )}
                              </div>

                              {isCurrent && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-black px-2 py-0.5 border-amber-300 text-amber-800 bg-amber-50 animate-pulse"
                                >
                                  Current Tier
                                </Badge>
                              )}
                              {!isAchieved && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100"
                                >
                                  Locked
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-extrabold text-base text-gray-900 capitalize flex items-center gap-1.5">
                                {tier.name}
                              </h4>
                              <p className="text-xs text-gray-400 font-medium leading-relaxed min-h-[36px] line-clamp-2">
                                {tier.description ||
                                  `${tier.discount_percentage}% base rate discount applied to booking checkouts.`}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold">
                            <span className="text-gray-400">
                              Required Points
                            </span>
                            <span
                              className="font-mono px-2 py-0.5 rounded-md text-[11px]"
                              style={{
                                backgroundColor: isAchieved
                                  ? `${tier.badge_color}15`
                                  : "#F3F4F6",
                                color: isAchieved
                                  ? tier.badge_color
                                  : "#4B5563",
                              }}
                            >
                              {tier.min_points.toLocaleString()} pts
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Left & Right Subtle Fade Indicator Fades */}
                  <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                  <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Points Vault Log Ledger Matrix */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-green-600" /> Immutable
                Vault Token Ledger
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ArrowUpDown className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-semibold">
                    No point operations logged within profile ledger scope
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Scope Identifier</th>
                        <th className="p-4">Action Mode</th>
                        <th className="p-4">Allocation Value</th>
                        <th className="p-4">Status Expiry Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                      {transactions.map((tx, idx) => {
                        const isEarn = tx.transaction_type === "EARN";
                        const isRedeem = tx.transaction_type === "REDEEM";

                        const completeRowKey = `${tx.loyalty_point_id || idx}-${idx}`;

                        const txDate = new Date(tx.earned_at);
                        const cleanTxDate = isValid(txDate)
                          ? format(txDate, "yyyy-MM-dd HH:mm")
                          : "Format Error";

                        return (
                          <tr
                            key={completeRowKey}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="p-4 text-xs font-mono text-gray-400">
                              {cleanTxDate}
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-gray-900">
                                {tx.description}
                              </p>
                              <p className="text-[10px] font-mono text-gray-400 max-w-[150px] truncate">
                                Ref:{" "}
                                {tx.booking_id || "Direct Modification Context"}
                              </p>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  isEarn
                                    ? "default"
                                    : isRedeem
                                      ? "destructive"
                                      : "outline"
                                }
                                className="text-[11px] font-bold"
                              >
                                {tx.transaction_type}
                              </Badge>
                            </td>
                            <td
                              className={`p-4 font-black text-base ${isEarn ? "text-emerald-600" : "text-rose-600"}`}
                            >
                              {isEarn ? "+" : ""}
                              {tx.points}
                            </td>
                            <td className="p-4 text-xs font-medium text-gray-500">
                              {tx.expires_at ? (
                                <span className="text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                                  Expires in {tx.days_remaining ?? "N/A"} days
                                </span>
                              ) : (
                                <span className="text-gray-400 font-mono italic">
                                  Persistent
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
