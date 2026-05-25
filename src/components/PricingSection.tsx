
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const navigate = useNavigate();
  
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
        { name: "Session ends after 60min inactivity", included: false },
        { name: "Personalized learning", included: false },
        { name: "Progress tracking", included: false },
        { name: "AI-powered feedback", included: false },
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
        { name: "Skill tracking & progress history", included: true },
        { name: "AI-powered feedback", included: true },
        { name: "Resume where you left off", included: true },
        { name: "All future Pro features", included: true },
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
        { name: "Skill tracking & progress history", included: true },
        { name: "AI-powered feedback", included: true },
        { name: "Resume where you left off", included: true },
        { name: "All future Pro features", included: true },
      ],
      color: "bg-kibi-600",
      borderColor: "border-kibi-700",
      buttonVariant: "default" as const,
      popular: false
    }
  ];

  const handleUpgrade = (plan: string) => {
    navigate('/settings', { state: { selectedPlan: plan } });
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-16" id="pricing">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4 cartoon-text">pricing plans</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Choose the plan that works best for your learning journey
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <Card 
            key={index}
            className={`${plan.color} border-4 ${plan.borderColor} rounded-2xl transform transition-all duration-300 hover:scale-105 hover:-rotate-1 relative overflow-hidden`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0">
                <div className="bg-kibi-300 text-dark-500 font-bold py-1 px-4 transform rotate-45 translate-x-6 translate-y-3 text-sm">
                  Popular
                </div>
              </div>
            )}
            <CardHeader className="text-white">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-300">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-white">
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-300 ml-1">{plan.period}</span>}
                {plan.subtext && (
                  <p className="text-sm text-gray-300 mt-1">{plan.subtext}</p>
                )}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-kibi-300 mr-2" />
                    ) : (
                      <X className="h-5 w-5 text-gray-500 mr-2" />
                    )}
                    <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button 
                onClick={() => handleUpgrade(plan.name)}
                variant={plan.buttonVariant}
                className="w-full"
              >
                {plan.price === "Free" ? "Get Started" : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <div className="bg-dark-400 border-4 border-dark-300 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">🎓 Student Plan - $50/year</h3>
          <p className="text-gray-400 mb-4">Verify with .edu email or upload school ID. Get Pro features for only $4.17/month.</p>
          <Button 
            variant="outline"
            onClick={() => handleUpgrade("Student")}
            className="bg-dark-300 hover:bg-dark-200"
          >
            Get Student Discount
          </Button>
        </div>
        
        <div className="mt-8 text-gray-500">
          <p>Refer a friend and get <span className="text-kibi-400 font-bold">+1 free session</span> for each sign-up!</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
