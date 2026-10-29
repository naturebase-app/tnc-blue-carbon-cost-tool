import { CostCalculator, CostPlans } from '@api/modules/calculations/calculators/cost.calculator';
import { RevenueProfitCalculator } from '@api/modules/calculations/calculators/revenue-profit.calculator';

describe('CostCalculator community benefit sharing', () => {
  const createCalculator = (
    revenue: Record<number, number>,
    otherOpex: Record<number, number>,
    projectLength = 4,
  ): CostCalculator => {
    const calculator = Object.create(CostCalculator.prototype) as CostCalculator;
    calculator.projectInput = {
      assumptions: {
        defaultProjectLength: 4,
        projectLength,
      },
      costAndCarbonInputs: {
        communityBenefitSharingFund: 0.5,
      },
    } as CostCalculator['projectInput'];
    calculator.revenueProfitCalculator = {
      calculateEstimatedRevenuePlan: jest.fn(() => revenue),
    } as unknown as RevenueProfitCalculator;
    calculator.costPlans = {
      monitoring: otherOpex,
      maintenance: {},
      carbonStandardFees: {},
      baselineReassessment: {},
      mrv: {},
      longTermProjectOperatingCost: {},
    } as unknown as CostPlans;
    return calculator;
  };

  it('uses 10% below threshold and adds 50% of profit at and above threshold', () => {
    const calculator = createCalculator(
      { 1: 100, 2: 100, 3: 120 },
      { 1: 95, 2: 90, 3: 90 },
      3,
    );

    expect(calculator.communityBenefitAndSharingCosts()).toMatchObject({
      1: 10,
      2: 15,
      3: 27,
      4: 0,
    });
  });

  it('can reach a 60% total share with no other OPEX', () => {
    const calculator = createCalculator({ 1: 100 }, {}, 1);

    expect(calculator.communityBenefitAndSharingCosts()[1]).toBe(60);
  });

  it('includes the benefit share in the reported OPEX plan', () => {
    const calculator = createCalculator({ 1: 100 }, { 1: 40 }, 1);
    calculator.opexTotalCostPlan = { 1: 0 };
    calculator.costPlans = {
      monitoring: { 1: 40 },
      maintenance: {},
      communityBenefitSharingFund: calculator.communityBenefitAndSharingCosts(),
      carbonStandardFees: {},
      baselineReassessment: {},
      mrv: {},
      longTermProjectOperatingCost: {},
      opexTotalCostPlan: calculator.opexTotalCostPlan,
    } as unknown as CostPlans;

    calculator.calculateOpexTotalPlan();

    expect(calculator.opexTotalCostPlan[1]).toBe(80);
  });

  it('returns zero for no-revenue and inactive years', () => {
    const calculator = createCalculator({ 1: 0, 2: 100 }, { 1: 20 }, 1);

    expect(calculator.communityBenefitAndSharingCosts()).toMatchObject({
      1: 0,
      2: 0,
    });
  });
});