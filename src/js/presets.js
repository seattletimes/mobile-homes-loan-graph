module.exports = {
  "Ackley": {
    description: "Short description of the Ackley case",
    term: 24,
    interest: 12.86,
    price: 96005.56,
    other: 10074.92,
    down: 4.9,
    depreciates: true
  },
  "Mansfield": {
    description: "Short description of the Mansfield case",
    term: 20,
    interest: 10.13,
    price: 56734,
    other: 1894,
    down: 0,
    depreciates: true
  },
  "Galler": {
    description: "Short description of the Galler case",
    term: 20,
    interest: 11.67,
    price: 37195,
    other: 5084.7,
    down: 9.5,
    depreciates: true
  },
  "trailer": {
    description: "This preset simulates the depreciation of a mobile home over time, at a rate of 5% yearly (against the original price) for the first three years, and 5% every two years after that.",
    term: 15,
    interest: 4.5,
    price: 80000,
    other: 2000,
    down: 20,
    customize: true,
    depreciates: true
  },
  "house": {
    description: "This preset simulates home ownership in a market where values are stable, meaning that the home neither appreciates nor depreciates over time.",
    term: 30,
    interest: 3.78,
    price: 300000,
    other: 2000,
    down: 20,
    customize: true
  }
};