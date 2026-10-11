package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
)

// Question представляет вопрос анкеты
type Question struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

// AnswersRequest представляет запрос с ответами
type AnswersRequest struct {
	Answers map[int]string `json:"answers"`
}

var (
	questions []Question
	answers   map[int]string
	mu        sync.RWMutex
)

func initQuestions() {
	questions = []Question{
		{ID: 1, Text: "Как вас зовут?"},
		{ID: 2, Text: "Какой ваш любимый язык программирования?"},
		{ID: 3, Text: "Сколько лет вы программируете?"},
		{ID: 4, Text: "Как вы узнали о нашем проекте?"},
		{ID: 5, Text: "Что бы вы хотели улучшить?"},
	}
	answers = make(map[int]string)
}

func handleQuestions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}

func handleAnswers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AnswersRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	mu.Lock()
	for qID, value := range req.Answers {
		answers[qID] = value
	}
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func main() {
	initQuestions()

	http.HandleFunc("/questions", handleQuestions)
	http.HandleFunc("/answers", handleAnswers)

	port := "8080"
	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
