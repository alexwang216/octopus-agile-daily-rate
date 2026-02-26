function About() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">About</h2>
      <div className="space-y-3 text-slate-300">
        <p>
          Octopus Agile Daily Rate shows the current and upcoming half-hourly
          electricity prices for the Octopus Energy Agile tariff.
        </p>
        <p>
          Agile Octopus is a tariff where the unit rate changes every 30
          minutes, linked to wholesale energy prices. Rates can go negative when
          there is excess renewable energy on the grid.
        </p>
      </div>
    </div>
  );
}

export default About;
