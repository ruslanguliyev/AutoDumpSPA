import { PromotedVehicles } from '@/features/promotions/components/PromotedVehicles';

/**
 * The home page block that Premium buys.
 *
 * It used to filter the parts list by an `isSponsored` flag that nothing ever set, so
 * it rendered nothing. Now it shows the listings whose owners actually paid for the
 * home page, and says so.
 */
const SponsoredProducts = () => <PromotedVehicles tier="PREMIUM" limit={4} />;

export default SponsoredProducts;
