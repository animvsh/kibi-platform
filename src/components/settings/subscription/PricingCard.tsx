
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  period?: string;
  subtext?: string;
  features: { name: string; included: boolean }[];
  color: string;
  borderColor: string;
  buttonVariant: "default" | "outline";
  popular?: boolean;
  onSubscribe: () => void;
}

const PricingCard = ({
  name,
  description,
  price,
  period,
  subtext,
  features,
  color,
  borderColor,
  buttonVariant,
  popular,
  onSubscribe
}: PricingCardProps) => {
  return (
    <Card 
      className={`${color} border-4 ${borderColor} rounded-2xl transform transition-all duration-300 hover:scale-105 hover:-rotate-1 relative overflow-hidden`}
    >
      {popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-kibi-300 text-dark-500 font-bold py-1 px-4 transform rotate-45 translate-x-6 translate-y-3 text-sm">
            Popular
          </div>
        </div>
      )}
      <CardHeader className="text-white">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <CardDescription className="text-gray-300">{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-white">
        <div className="mb-6">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-gray-300 ml-1">{period}</span>}
          {subtext && (
            <p className="text-sm text-gray-300 mt-1">{subtext}</p>
          )}
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-kibi-300 mr-2" />
              <span className="text-gray-200">{feature.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={onSubscribe}
          variant={buttonVariant}
          className="w-full"
        >
          {price === "Free" ? "Get Started" : "Upgrade"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
