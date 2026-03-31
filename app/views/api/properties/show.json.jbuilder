json.property do
  json.id @property.id
  json.label @property.label
  json.streetAddress @property.street_address
  json.aptNumber @property.apt_number || ''
  json.neighborhood @property.neighborhood || ''
  json.status @property.status
  json.price "$#{number_with_delimiter(@property.price)}"
  json.bedrooms @property.bedrooms
  json.fullBathrooms @property.full_bathrooms
  json.halfBathrooms @property.half_bathrooms
  json.propertyType @property.property_type
  json.area @property.area ? number_with_delimiter(@property.area) : ''
  json.schoolDistrict @property.school_district || ''
  json.schoolZone @property.school_zone || ''
  json.taxes @property.taxes ? number_to_currency(@property.taxes) : ''
  json.insurance @property.insurance || ''
  json.hoaFees @property.hoa_fees ? number_to_currency(@property.hoa_fees) : ''
  json.imageUrl @property.image_url
  json.html @property.html || ''
  json.notes @property.notes || ''
  json.dateAdded @property.date_added&.strftime('%-m/%-d')
  json.url @property.url
end
