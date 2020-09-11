import React from 'react'

const carPurchaseMonth = new Date('June 2020');
const monthlyMileageAllowance = (200000 / 10 / 12);

const calculateMileage = () => {
  const months = monthDiff(carPurchaseMonth, new Date);
  return (months * monthlyMileageAllowance).toLocaleString();
}

const monthDiff = (date1, date2) => {
  let result;
  result = (date2.getFullYear() - date1.getFullYear()) * 12;
  result -= date1.getMonth();
  result += date2.getMonth();
  return result;
};

export default () => (
  <div className="mileage widget">
    <h1>Max Mileage</h1>
    <p>{ calculateMileage() }</p>
  </div>
);
