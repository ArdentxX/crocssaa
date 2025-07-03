# Crocssa.pl 👟💬

**Crocssa.pl** to społecznościowa aplikacja randkowo-wymianowa inspirowana Tinderem – ale skoncentrowana wyłącznie na **crocsach**. Użytkownicy mogą prezentować swoje crocsy, łączyć się z innymi fanami tego obuwia i prowadzić rozmowy w czasie rzeczywistym.

---

## Funkcjonalność aplikacji

**Przeglądanie profili:**
- Oglądanie kart ze zdjęciami crocsów innych użytkowników
- Filtr wyszukiwania według nazwy użytkownika

**System swipe:**
- Swipe w prawo: polubienie crocsa
- Swipe w lewo: pominięcie
- Jeśli obie strony się polubią – dochodzi do matcha

**Czaty i wiadomości:**
- Czatowanie w czasie rzeczywistym dzięki **WebSocketom**
- Historia wiadomości wczytywana dla każdego matcha
- Wysyłanie wiadomości tekstowych z **emotkami (emoji picker)**
- Dzwoneczek i czerwony punkt jako **powiadomienie o nowych wiadomościach**
- Przypomnienie o nowych wiadomościach, nawet jeśli użytkownik był wcześniej wylogowany

**Profile i uploady:**
- Użytkownicy mogą:
  - Edytować dane profilowe (imię, nazwisko, lokalizacja, hobby)
  - Dodać zdjęcie profilowe oraz zdjęcie crocsa do przeglądania
- Zdjęcia są wyświetlane w karcie swipe z efektami

**Automatyczne odświeżanie:**
- Swipes i matche są regularnie odświeżane co kilka sekund bez potrzeby ręcznego reloadu

**Autoryzacja:**
- Rejestracja i logowanie z zabezpieczeniem hasła (bcrypt)
- Wylogowanie z przyciskiem, który przekierowuje na stronę główną

---
## Tech Stack

- **Frontend:**
  - React + React Hooks
  - socket.io-client
  - CSS (custom + animacje swipe)
  - emoji-mart (emotikony)

- **Backend:**
  - Flask
  - Flask-SocketIO (WebSocket)
  - SQLAlchemy (ORM)
  - SQLite (baza danych)
  - API REST do obsługi loginów, profili, swipes, matchy i wiadomości

- **Inne:**
  - Upload plików z pomocą `Flask` i `werkzeug`
  - Obsługa plików z lokalnego katalogu
  - Automatyczne połączenia z socketem po zalogowaniu

---
## Uruchamianie aplikacji
```
cd frontend
npm install 
npm run dev
```

```
cd backend
python -m venv venv
source venv/bin/activate  # lub venv\\Scripts\\activate na Windows
pip install -r requirements.txt
python main.py
```


---
## Autorzy

- **Kinga Surma** 
- **Radoslav Andrievich Bronkovich** 
- **Kacper Pabian (Ardent Amelka)** 

---

## Crocssa – Znajdź swoją parę. Dosłownie.
