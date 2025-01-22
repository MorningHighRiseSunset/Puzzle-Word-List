// Store all generated words
let storedWords = new Set();

async function fetchWords(amount) {
    const response = await fetch(
        `https://random-word-api.herokuapp.com/word?number=${amount}`
    );
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

async function generateWords() {
    const minLength = parseInt(document.getElementById('minLength').value);
    const maxLength = parseInt(document.getElementById('maxLength').value);
    const wordCount = parseInt(document.getElementById('wordCount').value);
    const outputContainer = document.getElementById('wordOutput');
    
    outputContainer.value += (outputContainer.value ? '\nGenerating more words...' : 'Generating words...');
    
    try {
        let newUniqueWords = 0;
        let attempts = 0;
        const maxAttempts = 10; // Prevent infinite loops if unique words are hard to find

        while (newUniqueWords < wordCount && attempts < maxAttempts) {
            // Calculate how many more words we need
            const remainingWords = wordCount - newUniqueWords;
            // Request extra words to account for duplicates and length filtering
            const requestAmount = Math.min(1000, remainingWords * 2);
            
            const words = await fetchWords(requestAmount);
            
            // Filter words based on length criteria and add only unique ones
            for (const word of words) {
                if (word.length >= minLength && 
                    word.length <= maxLength && 
                    !storedWords.has(word.toUpperCase())) {
                    storedWords.add(word.toUpperCase());
                    newUniqueWords++;
                }
                
                if (newUniqueWords >= wordCount) break;
            }
            
            attempts++;
        }
        
        // Convert Set to sorted array and join with commas
        const formattedWords = Array.from(storedWords).sort().join(', ');
        
        outputContainer.value = formattedWords;
        updateWordCount();
        
        if (storedWords.size === 0) {
            outputContainer.value = 'No words found matching the criteria. Try again.';
        }
    } catch (error) {
        outputContainer.value += '\nError generating words. Please try again.';
        console.error('Error:', error);
    }
}

function copyToClipboard() {
    const outputContainer = document.getElementById('wordOutput');
    outputContainer.select();
    document.execCommand('copy');
}

function clearWords() {
    storedWords.clear();
    document.getElementById('wordOutput').value = '';
    updateWordCount();
}

function updateWordCount() {
    const stats = document.getElementById('stats');
    stats.textContent = `Total unique words: ${storedWords.size}`;
}
