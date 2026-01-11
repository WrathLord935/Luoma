// AI Service implementation that calls the Local Python Backend
const BACKEND_URL = 'http://localhost:5000';

/**
 * Generates DIY upcycle ideas by calling the Python Backend
 * @param {Object} item - The clothing item object
 * @returns {Promise<Object>}
 */
export const generateDIYIdeas = async (item) => {
    try {
        const itemDescription = `${item.title} in ${item.condition} condition. Category: ${item.category}. Size: ${item.size}. ${item.description || ''}`;

        console.log('🔗 Calling Python Backend:', itemDescription);

        const response = await fetch(`${BACKEND_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: itemDescription })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Server Error');
        }

        const data = await response.json();
        console.log("✅ Python Response:", data);

        // Transform Python output to UI Format
        const ideas = data.upcycle_ideas?.map(idea => ({
            title: idea.new_item_name,
            description: idea.description,
            difficulty: mapFeasibilityToDifficulty(idea.feasibility_score),
            feasibilityScore: idea.feasibility_score,
            minSteps: 5,
            steps: idea.step_by_step_instructions,
            materials: ["Fabric Scissors", "Sewing Kit", "Creativity"] // Default/Generic or parse if available
        })) || [];

        return { ideas };

    } catch (error) {
        console.error('❌ AI Backend Error:', error);
        return {
            ideas: [],
            error: "Ensure 'python backend.py' is running! " + error.message
        };
    }
};

/**
 * Maps feasibility score (1-10) to difficulty level
 */
const mapFeasibilityToDifficulty = (score) => {
    if (score >= 8) return 'Easy';
    if (score >= 5) return 'Medium';
    return 'Hard';
};

/**
 * Image Generation (Stays mocked for now or can verify if Python sends images)
 */
export const generateDIYImage = async (ideaTitle) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (ideaTitle.includes('Jacket') || ideaTitle.includes('Bolero')) return "https://images.unsplash.com/photo-1548882522-8d76d8ba9866?w=600&q=80";
    if (ideaTitle.includes('Bag') || ideaTitle.includes('Tote')) return "https://images.unsplash.com/photo-1590874102752-ce33d4805ed5?w=600&q=80";
    if (ideaTitle.includes('Skirt')) return "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80";
    return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80";
};
