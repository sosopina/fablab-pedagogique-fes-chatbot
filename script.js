let responses = [];
let defaultResponse = "Désolé, je n'ai pas compris votre question. Vous pouvez me demander des informations sur les machines disponibles, les horaires d'ouverture, les formations, ou comment devenir membre. Vous pouvez également suivre notre page Facebook (FabLab Pédagogique Fès) pour plus d'informations. Comment puis-je vous aider ?";
let messageHistory = [];

// Load the responses from the JSON file
fetch('responses.json')
    .then(response => response.json())
    .then(data => {
        responses = data.questions;
        defaultResponse = data.default_response;
    })
    .catch(error => {
        console.error('Error loading responses:', error);
    });

// Get DOM elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const infoButton = document.querySelector('.info-button');
const infoModal = document.getElementById('info-modal');
const closeModal = document.querySelector('.close-modal');
const quickActionButtons = document.querySelectorAll('.quick-action-btn');

// Function to create typing indicator
function createTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Function to remove typing indicator
function removeTypingIndicator(typingDiv) {
    typingDiv.remove();
}

// Function to add a message to the chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to message history
    messageHistory.push({
        message: message,
        isUser: isUser,
        timestamp: new Date()
    });
}

// Function to calculate similarity between two strings
function calculateSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
}

// Function to find the best matching response
function findResponse(userQuestion) {
    userQuestion = userQuestion.toLowerCase().trim();
    
    // Try to find an exact match first
    const exactMatch = responses.find(q => q.question.toLowerCase() === userQuestion);
    if (exactMatch) {
        return exactMatch.answer;
    }
    
    // If no exact match, try to find the best partial match
    let bestMatch = null;
    let highestSimilarity = 0.3; // Minimum similarity threshold
    
    responses.forEach(q => {
        const similarity = calculateSimilarity(userQuestion, q.question);
        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            bestMatch = q;
        }
    });
    
    if (bestMatch) {
        return bestMatch.answer;
    }
    
    // If no match found, return the default response
    return defaultResponse;
}

// Function to simulate typing delay
function simulateTyping(message, callback) {
    const typingDiv = createTypingIndicator();
    const typingTime = Math.min(message.length * 30, 2000); // Max 2 seconds
    
    setTimeout(() => {
        removeTypingIndicator(typingDiv);
        callback();
    }, typingTime);
}

// Handle sending messages
function handleSend() {
    const message = userInput.value.trim();
    if (message) {
        // Add user message
        addMessage(message, true);
        
        // Clear input
        userInput.value = '';
        
        // Show typing indicator and get response
        const response = findResponse(message);
        simulateTyping(response, () => {
            addMessage(response);
        });
    }
}

// Handle quick action buttons
quickActionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const question = button.getAttribute('data-question');
        userInput.value = question;
        handleSend();
    });
});

// Handle info modal
infoButton.addEventListener('click', () => {
    infoModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    infoModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === infoModal) {
        infoModal.style.display = 'none';
    }
});

// Event listeners
sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSend();
    }
});

// Add welcome message with delay
setTimeout(() => {
    addMessage("Bonjour ! Je suis l'assistant du FabLab Pédagogique de Fès. Comment puis-je vous aider ?");
}, 500); 