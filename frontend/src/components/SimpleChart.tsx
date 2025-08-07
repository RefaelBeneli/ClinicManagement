import React from 'react';
import './SimpleChart.css';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title: string;
  type: 'bar' | 'pie' | 'line' | 'column';
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ 
  data, 
  title, 
  type, 
  height = 200 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const renderBarChart = () => (
    <div className="chart-container">
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-bar-group">
            <div className="chart-bar-label">{item.label}</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)`
                }}
              >
                <span className="chart-bar-value">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => {
    const centerX = 100; // SVG center X
    const centerY = 100; // SVG center Y
    const radius = 80;
    const labelRadius = 50; // Radius for percentage positioning
    
    // Sort data by value in descending order
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    let cumulativePercentage = 0;
    
    return (
    <div className="chart-container">
        <div className="pie-chart-wrapper">
          <svg className="pie-chart-svg" viewBox="0 0 200 200" width="180" height="180">
            {sortedData.map((item, index) => {
          const percentage = (item.value / totalValue) * 100;
              const startAngle = (cumulativePercentage / 100) * 360;
              const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
              const midAngle = (startAngle + endAngle) / 2;
              
              // Calculate label position for percentage
              const labelX = centerX + (labelRadius * Math.cos((midAngle - 90) * Math.PI / 180));
              const labelY = centerY + (labelRadius * Math.sin((midAngle - 90) * Math.PI / 180));
              
              let pathData;
              
              // Special case for 100% (full circle)
              if (percentage >= 99.9) {
                pathData = `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX - 0.1} ${centerY - radius} Z`;
              } else {
                // Create path for pie slice
                const startAngleRad = (startAngle - 90) * Math.PI / 180;
                const endAngleRad = (endAngle - 90) * Math.PI / 180;
                
                const x1 = centerX + radius * Math.cos(startAngleRad);
                const y1 = centerY + radius * Math.sin(startAngleRad);
                const x2 = centerX + radius * Math.cos(endAngleRad);
                const y2 = centerY + radius * Math.sin(endAngleRad);
                
                const largeArcFlag = percentage > 50 ? 1 : 0;
                
                pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
              }
              
              cumulativePercentage += percentage;
          
          return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={item.color || `hsl(${index * 60}, 70%, 60%)`}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {percentage >= 10 && ( // Only show percentages for slices larger than 10%
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pie-slice-percentage"
                      fill="white"
                      fontSize="14"
                      fontWeight="700"
                    >
                      {Math.round(percentage)}%
                    </text>
                  )}
                </g>
          );
        })}
          </svg>
          <div className="pie-center-info">
            <div className="pie-total-label">Total</div>
            <div className="pie-total-value">
              {typeof totalValue === 'number' && totalValue > 1000 
                ? `₪${Math.round(totalValue).toLocaleString()}`
                : totalValue
              }
        </div>
      </div>
          <div className={`pie-legend ${sortedData.length <= 3 ? 'legend-large' : sortedData.length <= 5 ? 'legend-medium' : 'legend-small'}`}>
            {sortedData.map((item, index) => {
              const percentage = (item.value / totalValue) * 100;
              
              return (
          <div key={index} className="legend-item">
            <div 
              className="legend-color"
              style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
            />
                  <span className="legend-label">
                    {item.label}
                  </span>
                  <span className="legend-value">
                    {typeof item.value === 'number' && item.value > 1000 
                      ? `₪${Math.round(item.value).toLocaleString()}`
                      : item.value
                    }
                  </span>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
  };

  const renderLineChart = () => (
    <div className="chart-container">
      <svg className="line-chart" viewBox={`0 0 300 ${height}`}>
        <polyline
          className="line-path"
          points={data.map((item, index) => 
            `${(index / (data.length - 1)) * 280 + 10},${height - (item.value / maxValue) * (height - 20) - 10}`
          ).join(' ')}
          fill="none"
          stroke="#667eea"
          strokeWidth="3"
        />
        {data.map((item, index) => (
          <circle
            key={index}
            cx={(index / (data.length - 1)) * 280 + 10}
            cy={height - (item.value / maxValue) * (height - 20) - 10}
            r="4"
            fill="#667eea"
          />
        ))}
      </svg>
      <div className="line-labels">
        {data.map((item, index) => (
          <div key={index} className="line-label">
            <span className="line-label-text">{item.label}</span>
            <span className="line-label-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderColumnChart = () => (
    <div className="chart-container">
      <div className="column-chart">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={index} className="column-group">
              <div className="column-container">
                <div 
                  className="column-bar"
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)`
                  }}
                >
                  <span className="column-value">
                    {typeof item.value === 'number' && item.value > 1000 
                      ? `₪${Math.round(item.value).toLocaleString()}`
                      : item.value
                    }
                  </span>
                </div>
              </div>
              <div className="column-label">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="simple-chart" style={{ height }}>
      <h4 className="chart-title">{title}</h4>
      {type === 'bar' && renderBarChart()}
      {type === 'pie' && renderPieChart()}
      {type === 'line' && renderLineChart()}
      {type === 'column' && renderColumnChart()}
    </div>
  );
};

export default SimpleChart; 