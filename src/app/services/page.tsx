import Link from "next/link";
import { Check } from "lucide-react";

export default function Services() {
  const plans = [
    {
      name: "Monthly",
      price: "$49",
      period: "/month",
      features: ["Full gym access", "Free group classes", "Locker room access", "1 Personal Training session"],
      popular: false
    },
    {
      name: "Half-Yearly",
      price: "$39",
      period: "/month",
      features: ["All Monthly features", "Diet consultation", "Body composition analysis", "Digital access card"],
      popular: true
    },
    {
      name: "Yearly",
      price: "$29",
      period: "/month",
      features: ["All Half-Yearly features", "Priority class booking", "Free guest pass monthly", "Exclusive gym merch"],
      popular: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Membership Plans</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Choose the plan that fits your goals. Unlock premium access, tracking, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <div key={i} className={`relative glass-card flex flex-col p-8 ${plan.popular ? 'border-blue-500/50 shadow-blue-500/10 scale-105 z-10' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-white/50">{plan.period}</span>
            </div>
            
            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup" className={`w-full text-center ${plan.popular ? 'primary-button' : 'glass-button'}`}>
              Select Plan
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
