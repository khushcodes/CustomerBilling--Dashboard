import React, { useState } from "react";

const CompanyRow = ({ companyKey, company }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate total cost and total submissions for this company
  let companyTotalCost = 0;
  let companyTotalSubmissions = 0;

  Object.keys(company).forEach((countryKey) => {
    const countryData = company[countryKey];
    companyTotalCost += countryData.totalcost || 0;
    companyTotalSubmissions += countryData.delivered || 0;
  });

  return (
    <>
      <div className="company-container">
        <div
          className="company-row"
          onClick={() => setShowDetails(!showDetails)}
          style={{
            cursor: "pointer",
            padding: "10px",
            background: showDetails ? "#e3f2fd" : "#f5f5f5",
            margin: "10px 0",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h4>{companyKey}</h4>
          <div>
            <span>Total Cost: {companyTotalCost.toFixed(2)}</span>
            <span>Total Submissions: {companyTotalSubmissions}</span>
          </div>
        </div>

        {showDetails && (
          <div className="company-details">
            <h5>Details for {companyKey}</h5>
            <table>
              <thead>
                <tr>
                  <th>Country Code</th>
                  <th>Total Cost</th>
                  <th>SMS Cost</th>
                  <th>Delivered</th>
                  <th>Failed</th>
                  <th>Other</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(company).map((countryKey) => {
                  const country = company[countryKey];
                  return (
                    <tr key={countryKey}>
                      <td>{countryKey}</td>
                      <td>{country.totalcost || 0}</td>
                      <td>{country.sms_cost || 0}</td>
                      <td>{country.delivered || 0}</td>
                      <td>{country.failed || 0}</td>
                      <td>{country.other || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default CompanyRow;
