
import { useToast } from "@/hooks/use-toast";
import PricingCard from "./subscription/PricingCard";
import ReferralSection from "./subscription/ReferralSection";
import StudentPlanCard from "./subscription/StudentPlanCard";

interface SubscriptionTabProps {
  currentPlan: string;
  sessionsUsed: number;
  sessionsTotal: number;
  selectedPlan: string | null;
  handleSubscribe: (plan: string) => void;
  handleReferralCopy: () => void;
}

const SubscriptionTab = ({
  currentPlan,
  sessionsUsed,
  sessionsTotal,
  selectedPlan,
  handleSubscribe,
  handleReferralCopy
}: SubscriptionTabProps) => {
  const pricingPlans = [
    {
      name: "Free Tier",
      description: "Explore kibi with limited access",
      price: "Free",
      features: [
        { name: "5 learning sessions", included: true },
        { name: "Upload files or type topics", included: true },
        { name: "Generate courses", included: true },
        { name: "Access to basic modules", included: true },
      ],
      color: "bg-dark-400",
      borderColor: "border-dark-300",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Pro Plan",
      description: "Unlock unlimited learning power",
      price: "$10",
      period: "per month",
      features: [
        { name: "Unlimited sessions", included: true },
        { name: "Upload files or type topics", included: true },
        { name: "Generate courses", included: true },
        { name: "Personalized learning", included: true },
      ],
      color: "bg-kibi-500",
      borderColor: "border-kibi-600",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Annual Plan",
      description: "Save 33% on your subscription",
      price: "$80",
      period: "per year",
      subtext: "Only $6.67/month",
      features: [
        { name: "Unlimited sessions", included: true },
        { name: "Upload files or type topics", included: true },
        { name: "Generate courses", included: true },
        { name: "Personalized learning", included: true },
      ],
      color: "bg-kibi-600",
      borderColor: "border-kibi-700",
      buttonVariant: "default" as const,
      popular: false
    }
  ];

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <PricingCard
            key={index}
            {...plan}
            onSubscribe={() => handleSubscribe(plan.name)}
          />
        ))}
      </div>

      <div className="mt-8">
        <StudentPlanCard onSubscribe={() => handleSubscribe("Student Plan")} />
      </div>

      <ReferralSection onCopyReferral={handleReferralCopy} />
    </div>
  );
};

export default SubscriptionTab;
