json.monthlyBudget Property.monthly_payment
json.amountSaved Property.amount_saved

json.properties @properties do |property|
  json.id property.id
  json.label property.label
  json.neighborhood property.neighborhood
  json.cashToClose property.cash_to_close
  json.monthlyPayment property.total_monthly_payment
  json.monthlyRemainder property.monthly_remainder
  json.closeRemainder property.close_remainder
  json.zonedPrimarySchool property.zoned_primary_school
  json.status property.status
  json.propertyType property.property_type_index_label
  json.dateAdded property.date_added
end
