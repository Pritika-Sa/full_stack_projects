import axios from 'axios';

export const getTopics = async () => {
  return [
    'Age',
    'Calendar',
    'MixtureAndAlligation',
    'PermutationAndCombination',
    'PipesAndCistern',
    'ProfitAndLoss',
    'SimpleInterest',
    'SpeedTimeDistance',
    'Random'
  ];
};

// ✅ No formatting required — topics are already API-compatible
export const getAptiQuestions = async (topic, difficulty = 'medium') => {
  try {
    const encodedTopic = encodeURIComponent(topic); // safe encode
    const encodedDifficulty = encodeURIComponent(difficulty);
    const res = await axios.get(`https://aptitude-api.vercel.app/${encodedTopic}?difficulty=${encodedDifficulty}`);

    console.log("✔ API raw response:", res.data);

    if (res.data && typeof res.data === 'object' && res.data.question) {
      return [res.data]; // Wrap in array for consistency
    } else {
      throw new Error("API did not return a valid question");
    }
  } catch (err) {
    console.error("❌ Failed to fetch aptitude questions:", err);
    throw err;
  }
};
