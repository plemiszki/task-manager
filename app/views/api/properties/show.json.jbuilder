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
  json.schoolZone @property.school_zone || ''
  json.taxes @property.taxes || 0
  json.taxesFormatted @property.taxes ? number_to_currency(@property.taxes, precision: @property.taxes.to_f % 1 == 0 ? 0 : 2) : ''
  json.insurance @property.insurance || ''
  json.hoaFees @property.hoa_fees
  json.hoaFeesFormatted @property.hoa_fees ? number_to_currency(@property.hoa_fees, precision: @property.hoa_fees.to_f % 1 == 0 ? 0 : 2) : ''
  json.imageUrl @property.image_url
  json.html @property.html || ''
  json.notes @property.notes || ''
  json.dateAdded @property.date_added&.strftime('%-m/%-d')
  json.url @property.url
end
