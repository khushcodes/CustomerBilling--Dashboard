import React, { useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  const fetchBillingData = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date");
      return;
    }

    setLoading(true);
    setError(null);

    const apiUrl = `https://napi.authkey.io/api/react_test?from_date=${fromDate}&to_date=${toDate}`;
    try {
      const response = await axios.get(apiUrl);
      if (response.data && response.data.success && response.data.data) {
        setData(response.data.data);

        // Calculate the total cost and total submissions for all companies
        let totalCostSum = 0;
        let totalSubmissionsSum = 0;

        Object.keys(response.data.data).forEach((companyKey) => {
          const company = response.data.data[companyKey];

          // Summing up cost and submissions for each country code within the company
          let companyTotalCost = 0;
          let companyTotalSubmissions = 0;

          // Loop through the country data of the company
          Object.keys(company).forEach((countryKey) => {
            const countryData = company[countryKey];

            // Summing up cost and submissions for each SMS cost key
            Object.keys(countryData).forEach((smsCostKey) => {
              const smsData = countryData[smsCostKey];

              companyTotalCost += smsData.totalcost || 0;

              // Ensure 'delivered' is treated as a number
              const delivered = Number(smsData.delivered);
              if (!isNaN(delivered)) {
                companyTotalSubmissions += delivered;
              }
            });
          });

          // Add the summed cost and submissions for this company
          totalCostSum += companyTotalCost;
          totalSubmissionsSum += companyTotalSubmissions;
        });

        // Set the totals for display
        setTotalCost(totalCostSum);
        setTotalSubmissions(totalSubmissionsSum);
      } else {
        setError("No data found for the selected date range.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Customer Billing Dashboard</h1>

      <div className="filters">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <button onClick={fetchBillingData}>Search</button>
      </div>

      {loading && <div className="spinner">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {data && (
        <div>
          {/* Display Total Cost and Submissions for All Companies */}
          <h2>Total Cost: {totalCost.toFixed(2)}</h2>
          <h2>Total Submissions: {totalSubmissions}</h2>

          {/* Loop through each company and show the data */}
          {Object.keys(data).map((companyKey) => {
            const company = data[companyKey];
            return (
              <CompanyRow
                key={companyKey}
                companyKey={companyKey}
                company={company}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// Component to display each company's data and details
const CompanyRow = ({ companyKey, company }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate total cost and total submissions for this company
  let companyTotalCost = 0;
  let companyTotalSubmissions = 0;

  // Iterate over the nested data (country and SMS cost)
  Object.keys(company).forEach((countryKey) => {
    const countryData = company[countryKey];

    Object.keys(countryData).forEach((smsCostKey) => {
      const smsData = countryData[smsCostKey];

      // Add the cost for this row to the total cost for the company
      companyTotalCost += smsData.totalcost || 0;

      // Ensure 'delivered' is treated as a number
      const delivered = Number(smsData.delivered);
      if (!isNaN(delivered)) {
        companyTotalSubmissions += delivered;
      } else {
        console.warn(`Invalid delivered value for ${smsCostKey}:`, smsData.delivered);
      }
    });
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
            {/* Show total cost and total submissions for the company */}
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

                  return Object.keys(country).map((smsCostKey) => {
                    const countryData = country[smsCostKey];
                    return (
                      <tr key={smsCostKey}>
                        <td>{countryKey}</td> {/* Country Code */}
                        <td>{countryData.totalcost || 0}</td>
                        <td>{smsCostKey}</td>
                        <td>{Number(countryData.delivered) || 0}</td> {/* Ensure delivered is treated as a number */}
                        <td>{countryData.failed || 0}</td>
                        <td>{countryData.other || 0}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
