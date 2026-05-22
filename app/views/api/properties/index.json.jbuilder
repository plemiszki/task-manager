json.properties @properties do |property|
  json.id property.id
  json.label property.label
  json.neighborhood property.neighborhood
  json.amountNeeded property.amount_needed
  json.monthlyPayment property.actual_monthly_payment
  json.zonedPrimarySchool property.zoned_primary_school
  json.status property.status
  json.propertyType property.property_type_index_label
  json.dateAdded property.date_added
end
