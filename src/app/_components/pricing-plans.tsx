import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const PricingPlans = () => {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
          Pricing Plans
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {['Free', 'Pro', 'Enterprise'].map((plan) => (
            <div
              key={plan}
              className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-gray-850 justify-between"
            >
              <div>
                <h3 className="text-2xl font-bold text-center mb-4">{plan}</h3>
                <ul className="space-y-2 mb-6">
                  {[
                    'Basic features',
                    'Up to 10 boards',
                    '2 team members',
                    ...(plan !== 'Free'
                      ? [
                          'Unlimited boards',
                          'Unlimited team members',
                          'Priority support',
                        ]
                      : []),
                    ...(plan === 'Enterprise'
                      ? ['Custom integrations', 'Dedicated account manager']
                      : []),
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="w-full mt-6">
                {plan === 'Free' ? 'Sign Up' : 'Contact Sales'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
