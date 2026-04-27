from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import nltk
from nltk.corpus import stopwords


NLTK_RESOURCES = ['stopwords', 'punkt', 'averaged_perceptron_tagger', 'punkt_tab', 'averaged_perceptron_tagger_eng']

print("--- Checking NLTK resources ---")
for resource in NLTK_RESOURCES:
    try:
        if resource == 'stopwords':
            nltk.data.find('corpora/stopwords')
        elif resource == 'punkt':
            nltk.data.find('tokenizers/punkt')
        elif resource == 'averaged_perceptron_tagger':
            nltk.data.find('taggers/averaged_perceptron_tagger')
        elif resource == 'averaged_perceptron_tagger_eng':
            nltk.data.find('taggers/averaged_perceptron_tagger_eng')
        elif resource == 'punkt_tab':
            nltk.data.find('tokenizers/punkt_tab')
        print(f"Resource '{resource}' found.")
    except LookupError:
        print(f"Resource '{resource}' not found. Downloading...")
        nltk.download(resource)
print("--- NLTK Ready ---")

app = Flask(__name__)
CORS(app)

STOPWORDS = set(stopwords.words('english')) | set(stopwords.words('romanian'))

def preprocess_text(text):
    if not text:
        return ""
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = text.lower()
    words = text.split()
    words = [w for w in words if w not in STOPWORDS and len(w) > 2]
    return " ".join(words)

def extract_skills(cv_text, job_text):
    """
    Extract skills dynamically with high precision.
    """
    tokens = nltk.word_tokenize(job_text.lower())
    
    # Extended NOISE words (nouns that are NOT skills)
    NOISE = {
        'team', 'years', 'experience', 'environment', 'work', 'development', 
        'knowledge', 'ability', 'role', 'responsibilities', 'background', 
        'requirements', 'candidate', 'skills', 'excellent', 'strong',
        'office', 'remote', 'salary', 'benefits', 'company', 'location', 
        'city', 'availability', 'level', 'degree', 'opportunity', 'plus',
        'software', 'details', 'application', 'process', 'interview'
    }
  
    CORE_VOCAB = {
        "java", "python", "javascript", "spring", "react", "sql", "git", "c++", ".net", "c#",
        "docker", "kubernetes", "aws", "azure", "angular", "node", "typescript",
        "management", "marketing", "sales", "communication", "leadership", 
        "excel", "finance", "accounting", "hr", "customer", "project"
    }
    
    tagged = nltk.pos_tag(tokens)
    
    # identify potential skills
    required_keywords = set()
    for word, tag in tagged:
        # Priority 1: Words in our Core Vocab
        if word in CORE_VOCAB:
            required_keywords.add(word)
        # Priority 2: Nouns that are NOT noise and NOT stopwords
        elif tag.startswith('NN') and word not in STOPWORDS and word not in NOISE and len(word) > 2:
            required_keywords.add(word)
        # Priority 3: Special tech symbols
        elif any(char in word for char in ['+', '#']) and len(word) > 1:
            required_keywords.add(word)
    
    cv_text_lower = cv_text.lower()
    
    # 2. Smart Matching 
    def is_match(keyword, text):
        if keyword in text: return True
        if keyword == "developer" and "dev" in text: return True
        if keyword == "dev" and "developer" in text: return True
        return False

    matched = [kw for kw in required_keywords if is_match(kw, cv_text_lower)]
    missing = [kw for kw in required_keywords if not is_match(kw, cv_text_lower)]
    
    return ", ".join(sorted(matched)), ", ".join(sorted(missing))
    
    # Return as sorted strings
    return ", ".join(sorted(matched)), ", ".join(sorted(missing))

import traceback

@app.route('/classify', methods=['POST'])
def classify():
    try:
        print(">>> Request received on /classify")
        data = request.get_json()
        if not data:
            print("!!! Error: No data provided")
            return jsonify({"error": "No JSON payload received"}), 400
            
        cv_text = data.get('cv_text', '')
        job_reqs = data.get('job_requirements', '')
        
        print(f">>> Processing CV ({len(cv_text)} chars) and Job ({len(job_reqs)} chars)")
        
        if not cv_text or not job_reqs:
            print("!!! Error: Missing CV or Job requirements")
            return jsonify({"score": 0, "matchedSkills": "", "missingSkills": "", "error": "Missing input data"}), 400
            
        # preprocess for text similarity
        print(">>> Step 1: Preprocessing text...")
        clean_cv = preprocess_text(cv_text)
        clean_job = preprocess_text(job_reqs)
        
        print(">>> Step 2: Calculating TF-IDF similarity...")
        similarity = 0.0
        try:
            if clean_cv.strip() and clean_job.strip():
                vectorizer = TfidfVectorizer()
                tfidf_matrix = vectorizer.fit_transform([clean_cv, clean_job])
                similarity = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
                print(f"Similarity: {similarity:.2f}")
        except Exception as e:
            print(f"!!! TF-IDF localized error: {e}")
            similarity = 0.0
            
        
        print(">>> Step 3: Extracting skills...")
        matched_str, missing_str = extract_skills(cv_text, job_reqs)
        
        # calculate skill match score
        print(">>> Step 4: Normalizing scores...")
        matched_list = [s.strip() for s in matched_str.split(',') if s.strip()]
        missing_list = [s.strip() for s in missing_str.split(',') if s.strip()]
        
        total_skills_required = len(matched_list) + len(missing_list)
        skill_score = 0.0
        if total_skills_required > 0:
            skill_score = len(matched_list) / total_skills_required
        else:
            skill_score = similarity
        
        final_score = (skill_score * 0.8) + (similarity * 0.2)
        print(f"--- SUCCESS! Final Score: {final_score:.2f} ---")
        
        return jsonify({
            "score": final_score,
            "matchedSkills": matched_str,
            "missingSkills": missing_str,
            "textSimilarity": similarity,
            "skillScore": skill_score
        })
        
    except Exception as e:
        print("!!! ERROR DURING CLASSIFICATION !!!")
        print(traceback.format_exc()) 
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
