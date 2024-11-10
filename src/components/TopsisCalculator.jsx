import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

const TOPSISCalculator = () => {
  const [alternatives, setAlternatives] = useState(['A1', 'A2']);
  const [criteria, setCriteria] = useState(['C1', 'C2', 'C3']);
  const [weights, setWeights] = useState([1, 1, 1]);
  const [types, setTypes] = useState(['benefit', 'benefit']);
  const [matrix, setMatrix] = useState([[0, 0], [0, 0]]);
  const [result, setResult] = useState(null);

  const addCriteria = () => {
    setCriteria([...criteria, `C${criteria.length + 1}`]);
    setWeights([...weights, 0.5]);
    setTypes([...types, 'benefit']);
    setMatrix(matrix.map(row => [...row, 0]));
  };

  const removeCriteria = (index) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
      setWeights(weights.filter((_, i) => i !== index));
      setTypes(types.filter((_, i) => i !== index));
      setMatrix(matrix.map(row => row.filter((_, i) => i !== index)));
    }
  };

  const addAlternative = () => {
    setAlternatives([...alternatives, `A${alternatives.length + 1}`]);
    setMatrix([...matrix, new Array(criteria.length).fill(0)]);
  };

  const removeAlternative = (index) => {
    if (alternatives.length > 1) {
      setAlternatives(alternatives.filter((_, i) => i !== index));
      setMatrix(matrix.filter((_, i) => i !== index));
    }
  };

  const handleCriteriaNameChange = (index, value) => {
    const newCriteria = [...criteria];
    newCriteria[index] = value;
    setCriteria(newCriteria);
  };

  const handleAlternativeNameChange = (index, value) => {
    const newAlternatives = [...alternatives];
    newAlternatives[index] = value;
    setAlternatives(newAlternatives);
  };

  const normalize = (matrix) => {
    const normalizedMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
      normalizedMatrix[i] = [];
      for (let j = 0; j < matrix[0].length; j++) {
        const sumSquares = matrix.reduce((acc, row) => acc + Math.pow(row[j], 2), 0);
        normalizedMatrix[i][j] = matrix[i][j] / Math.sqrt(sumSquares);
      }
    }
    return normalizedMatrix;
  };

  const calculateWeighted = (normalized) => {
    const weighted = [];
    for (let i = 0; i < normalized.length; i++) {
      weighted[i] = [];
      for (let j = 0; j < normalized[0].length; j++) {
        weighted[i][j] = normalized[i][j] * weights[j];
      }
    }
    return weighted;
  };

  const findIdealSolutions = (weighted) => {
    const positive = [];
    const negative = [];
    
    for (let j = 0; j < weighted[0].length; j++) {
      const column = weighted.map(row => row[j]);
      if (types[j] === 'benefit') {
        positive[j] = Math.max(...column);
        negative[j] = Math.min(...column);
      } else {
        positive[j] = Math.min(...column);
        negative[j] = Math.max(...column);
      }
    }
    
    return { positive, negative };
  };

  const calculateDistances = (weighted, idealSolutions) => {
    const distances = [];
    
    for (let i = 0; i < weighted.length; i++) {
      let positiveDistance = 0;
      let negativeDistance = 0;
      
      for (let j = 0; j < weighted[0].length; j++) {
        positiveDistance += Math.pow(weighted[i][j] - idealSolutions.positive[j], 2);
        negativeDistance += Math.pow(weighted[i][j] - idealSolutions.negative[j], 2);
      }
      
      distances.push({
        positive: Math.sqrt(positiveDistance),
        negative: Math.sqrt(negativeDistance)
      });
    }
    
    return distances;
  };

  const calculatePreferences = (distances) => {
    return distances.map(d => d.negative / (d.positive + d.negative));
  };

  const calculate = () => {
    const normalizedMatrix = normalize(matrix);
    const weightedMatrix = calculateWeighted(normalizedMatrix);
    const idealSolutions = findIdealSolutions(weightedMatrix);
    const distances = calculateDistances(weightedMatrix, idealSolutions);
    const preferences = calculatePreferences(distances);
    
    const results = alternatives.map((alt, idx) => ({
      alternative: alt,
      score: preferences[idx],
      rank: 0
    }));
    
    results.sort((a, b) => b.score - a.score);
    
    results.forEach((item, idx) => {
      item.rank = idx + 1;
    });
    
    setResult(results);
  };

  const handleMatrixChange = (i, j, value) => {
    const newMatrix = [...matrix];
    newMatrix[i][j] = parseFloat(value) || 0;
    setMatrix(newMatrix);
  };

  const handleWeightChange = (index, value) => {
    const newWeights = [...weights];
    newWeights[index] = parseFloat(value) || 0;
    setWeights(newWeights);
  };

  const handleTypeChange = (index, value) => {
    const newTypes = [...types];
    newTypes[index] = value;
    setTypes(newTypes);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <Analytics />
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">TOPSIS Calculator</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <button 
                onClick={addCriteria}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus size={16} /> Tambah Kriteria
              </button>
              <button 
                onClick={addAlternative}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus size={16} /> Tambah Alternatif
              </button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Decision Matrix</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 p-4">Alternative</th>
                      {criteria.map((c, i) => (
                        <th key={i} className="border border-gray-200 p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={c}
                              onChange={(e) => handleCriteriaNameChange(i, e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                            <button
                              onClick={() => removeCriteria(i)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="mt-2">
                            <select
                              className="w-full p-1 text-sm border rounded mb-2"
                              value={types[i]}
                              onChange={(e) => handleTypeChange(i, e.target.value)}
                            >
                              <option value="benefit">Benefit</option>
                              <option value="cost">Cost</option>
                            </select>
                            <input
                              type="number"
                              value={weights[i]}
                              onChange={(e) => handleWeightChange(i, e.target.value)}
                              className="w-full p-1 border rounded"
                              placeholder="Weight"
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alt, i) => (
                      <tr key={i}>
                        <td className="border border-gray-200 p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={alt}
                              onChange={(e) => handleAlternativeNameChange(i, e.target.value)}
                              className="w-24 p-1 border rounded"
                            />
                            <button
                              onClick={() => removeAlternative(i)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                        {criteria.map((_, j) => (
                          <td key={j} className="border border-gray-200 p-4">
                            <input
                              type="number"
                              value={matrix[i][j]}
                              onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button 
              onClick={calculate}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Calculate TOPSIS
            </button>

            {result && (
              <div>
                <h3 className="text-lg font-medium mb-2">Results</h3>
                <table className="min-w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 p-4">Alternative</th>
                      <th className="border border-gray-200 p-4">Score</th>
                      <th className="border border-gray-200 p-4">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((item, i) => (
                      <tr key={i}>
                        <td className="border border-gray-200 p-4">{item.alternative}</td>
                        <td className="border border-gray-200 p-4">{item.score.toFixed(4)}</td>
                        <td className="border border-gray-200 p-4">{item.rank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm text-center text-gray-500">
          Made with ❤️ by <a href="https://www.linkedin.com/in/adhimtanfitra/" className="text-blue-500 hover:underline">Adhim Tanfitra</a>
          <br></br>
          Kelompok 6 SI21C
        </p>
      </div>
    </div>
  );
};

export default TOPSISCalculator;