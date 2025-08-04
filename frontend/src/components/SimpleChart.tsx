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
  type: 'bar' | 'pie' | 'line';
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

  const renderPieChart = () => (
    <div className="chart-container">
      <div className="pie-chart">
        {data.map((item, index) => {
          const percentage = (item.value / totalValue) * 100;
          const rotation = data
            .slice(0, index)
            .reduce((sum, d) => sum + (d.value / totalValue) * 360, 0);
          
          return (
            <div
              key={index}
              className="pie-segment"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(
                  ${item.color || `hsl(${index * 60}, 70%, 60%)`} 0deg,
                  ${item.color || `hsl(${index * 60}, 70%, 60%)`} ${percentage * 3.6}deg,
                  transparent ${percentage * 3.6}deg
                )`
              }}
            />
          );
        })}
        <div className="pie-center">
          <div className="pie-total">{totalValue}</div>
        </div>
      </div>
      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color"
              style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
            />
            <span className="legend-label">{item.label}</span>
            <span className="legend-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

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

  return (
    <div className="simple-chart" style={{ height }}>
      <h4 className="chart-title">{title}</h4>
      {type === 'bar' && renderBarChart()}
      {type === 'pie' && renderPieChart()}
      {type === 'line' && renderLineChart()}
    </div>
  );
};

export default SimpleChart; 