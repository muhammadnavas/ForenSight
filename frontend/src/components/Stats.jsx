
const Stats = () => {
  const stats = [
    {
      number: "10x",
      label: "Faster Evidence Extraction"
    },
    {
      number: "99.9%",
      label: "Analysis Accuracy"
    },
    {
      number: "24/7",
      label: "Investigation Support"
    },
    {
      number: "100+",
      label: "Supported File Types"
    }
  ];

  const sectionStyle = {
    padding: '64px 0',
    backgroundColor: '#1e3a8a',
    color: 'white'
  };

  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px',
    textAlign: 'center'
  };

  const numberStyle = {
    fontSize: 'clamp(2.5rem, 8vw, 4rem)',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#dbeafe'
  };

  const labelStyle = {
    color: '#bfdbfe',
    fontWeight: '500'
  };

  return (
    <div className="py-16 bg-blue-900 text-white" style={sectionStyle}>
      <div className="container mx-auto px-6" style={containerStyle}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto" style={gridStyle}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-blue-100" style={numberStyle}>
                {stat.number}
              </div>
              <div className="text-blue-200 font-medium" style={labelStyle}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;