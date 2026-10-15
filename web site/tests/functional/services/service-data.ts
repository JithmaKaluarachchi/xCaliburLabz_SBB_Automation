export type ServiceDefinition = {
  name: string;
  path: string;
  description: RegExp;
  ctaHeading: string;
  features: string[];
};

export const services: ServiceDefinition[] = [
  {
    name: 'All Gases & Equipments',
    path: '/services/all-gases-and-equipments',
    description: /complete range of certified industrial and medical gases/i,
    ctaHeading: 'Need gas supply or the right equipment?',
    features: ['Complete Gas Range', 'Certified Purity', 'Gas Equipment', 'Fast Cylinder Refills', 'Island-wide Delivery', 'Safety-first Handling']
  },
  {
    name: 'Ship Handling',
    path: '/services/ship-handling',
    description: /dependable gas supply and cylinder logistics for vessels and ports/i,
    ctaHeading: 'Supplying a vessel or planning a port call?',
    features: ['Marine-grade Gas Supply', 'Cylinder Logistics', 'Dockside Delivery', '24/7 Dispatch', 'Compliant Documentation', 'Safety-first Handling']
  }
];

