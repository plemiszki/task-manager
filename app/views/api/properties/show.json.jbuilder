json.property do
  json.id @property.id
  json.label @property.label
  json.streetAddress @property.street_address
  json.aptNumber @property.apt_number || ''
  json.neighborhood @property.neighborhood || ''
  json.status @property.status
  json.price @property.price
  json.priceFormatted @property.price ? number_to_currency(@property.price, precision: @property.price.to_f % 1 == 0 ? 0 : 2) : ''
  json.bedrooms @property.bedrooms
  json.fullBathrooms @property.full_bathrooms
  json.halfBathrooms @property.half_bathrooms
  json.propertyType @property.property_type
  json.area @property.area ? number_with_delimiter(@property.area) : ''
  json.schoolDistrict @property.school_district || ''
  json.zonedPrimarySchool @property.zoned_primary_school || ''
  json.taxes @property.taxes || 0
  json.taxesFormatted @property.taxes ? number_to_currency(@property.taxes, precision: @property.taxes.to_f % 1 == 0 ? 0 : 2) : ''
  json.insurance @property.insurance || ''
  json.hoaFees @property.hoa_fees || 0
  json.hoaFeesFormatted @property.hoa_fees ? number_to_currency(@property.hoa_fees, precision: @property.hoa_fees.to_f % 1 == 0 ? 0 : 2) : ''
  json.amountSaved Property.amount_saved
  json.monthlyPayment Property.monthly_payment
  json.interestRate Property.interest_rate
  json.ourOffer @property.our_offer
  json.ourOfferSet @property.our_offer_set?
  json.totalCarryingCosts @property.total_carrying_costs
  json.piBudget @property.pi_budget
  json.piPayment @property.pi_payment
  json.canAffordPi @property.can_afford_pi?
  json.piRemainder @property.pi_remainder
  json.downPayment @property.down_payment
  json.closingCosts Property::CLOSING_COSTS
  json.cashToClose @property.cash_to_close
  json.canAffordClose @property.can_afford_close?
  json.remainder @property.remainder || 0
  json.amountNeededForClose @property.amount_needed_for_close || 0
  json.imageUrl @property.image_url || ''
  json.html @property.html || ''
  json.notes @property.notes || ''
  json.dateAdded @property.date_added&.strftime('%-m/%-d')
  json.url @property.url
end
