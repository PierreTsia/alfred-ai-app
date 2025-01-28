// Helper function to calculate L2 (Euclidean) distance
function l2Distance(a: number[], b: number[]): number {
  return Math.sqrt(
    a.reduce((sum: number, val: number, i) => sum + Math.pow(val - b[i], 2), 0),
  );
}

// Helper function to calculate similarity score from distance
function distanceToSimilarity(distance: number): number {
  // Convert distance to a similarity score between 0 and 1
  // Using a threshold of 4 (about the magnitude of our vectors)
  return Math.max(0, Math.min(1, 1 - distance / 4));
}

describe.skip("Together AI Embeddings Tests", () => {
  it("should test semantic similarities", async () => {
    // Test pairs with expected similarities
    const testPairs = [
      // Control pair (same word) - should be ~100%
      ["test", "test"],

      // Antonyms - should be very different
      ["hot", "cold"],
      ["love", "hate"],

      // Completely unrelated - should be very different
      ["banana", "democracy"],
      ["guitar", "photosynthesis"],

      // Same topic but different - should be somewhat similar
      ["violin", "guitar"],
      ["python", "javascript"],

      // Similar meaning - should be very similar
      ["happy", "joyful"],
      ["big", "large"],
    ];

    console.log("🧪 Testing Semantic Similarities...\n");

    try {
      const words = testPairs.flat();
      const response = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: words }),
      });

      const result = await response.json();
      const embeddings = result.embeddings;

      // Debug info for first pair
      const v1 = embeddings[0];
      const v2 = embeddings[1];
      console.log("Debug for 'test' vs 'test':");
      console.log(
        "Vector 1 magnitude:",
        Math.sqrt(v1.reduce((sum: number, val: number) => sum + val * val, 0)),
      );
      console.log(
        "Vector 2 magnitude:",
        Math.sqrt(v2.reduce((sum: number, val: number) => sum + val * val, 0)),
      );
      console.log("First 5 values v1:", v1.slice(0, 5));
      console.log("First 5 values v2:", v2.slice(0, 5));
      console.log("\n-------------------\n");

      // Compare each pair
      testPairs.forEach(([word1, word2], i) => {
        const vec1 = embeddings[i * 2];
        const vec2 = embeddings[i * 2 + 1];

        const distance = l2Distance(vec1, vec2);
        const similarity = distanceToSimilarity(distance);

        // Only show bar if similarity is positive
        const barLength = Math.max(0, Math.round(similarity * 40));
        const bar = "█".repeat(barLength) + "░".repeat(40 - barLength);

        console.log(`\n${word1} vs ${word2}:`);
        console.log(`${bar} ${(similarity * 100).toFixed(1)}%`);
        console.log(`L2 Distance: ${distance.toFixed(3)}`);
      });
    } catch (error) {
      console.error("❌ Test failed:", error);
      throw error; // Re-throw to fail the test
    }
  });
});
