# Crocssa.pl 

Crocssa.pl to aplikacja społecznościowa typu "Tinder", ale z naciskiem na wymianę doświadczeń z obuwiem, w szczególności na crocsy. Użytkownicy mogą przeglądać zdjęcia swoich crocsów, dodać opis, podać szczegóły (model, kolor, rozmiar, liczba dziurek, ozdoby itp.), a następnie nawiązywać interakcje poprzez system czatów.

Aplikacja pozwala na:
- Przeglądanie crocsów innych użytkowników.
- Swajpowanie (lajkowanie/odrzucanie) na wzór aplikacji Tinder.
- Rozpoczynanie rozmów po wzajemnym swajpowaniu.
- Czatowanie w czasie rzeczywistym z użyciem WebSocketów.
- Powiadomienia o nowych wiadomościach.
- Emotikony w wiadomościach.

## Technologie

- **Frontend:** Vue.js (SPA)
- **Backend:** Flask (Python)
- **Baza danych:** PostgreSQL
- **WebSockety:** Flask-SocketIO
- **Autentykacja:** JWT (JSON Web Tokens)
- **Powiadomienia:** Long-polling / WebSockety

## Struktura projektu

### Frontend (Vue.js)

```
frontend/
│
├── public/                # Statyczne pliki (index.html, favicon itp.)
│
├── src/                   # Katalog z głównymi plikami aplikacji
│   ├── assets/            # Obrazy, czcionki i inne zasoby statyczne
│   ├── components/        # Komponenty Vue.js (np. Chat, Swiping, Profile)
│   ├── views/             # Widoki (np. Home, Login, Chat)
│   ├── router/            # Konfiguracja tras (Vue Router)
│   ├── store/             # Vuex (do zarządzania stanem aplikacji)
│   ├── App.vue            # Główny komponent aplikacji
│   ├── main.js            # Punkt wejścia aplikacji
│
└── package.json           # Plik konfiguracyjny npm (zależności, skrypty)

```


### Backend (Flask)

```
backend/
│
├── app/                   # Główny folder aplikacji
│   ├── models/            # Modele bazy danych (SQLAlchemy)
│   ├── routes/            # Trasy (endpointy API)
│   ├── static/            # Statyczne pliki (CSS, JS, obrazy)
│   ├── templates/         # Szablony HTML (jeśli potrzebne)
│   ├── socketio/          # Obsługa WebSocketów
│   ├── __init__.py        # Inicjalizacja aplikacji Flask
│   └── config.py          # Konfiguracja aplikacji (np. baza danych)
│
├── requirements.txt       # Lista zależności Pythona
└── run.py                 # Punkt wejścia do aplikacji (uruchomienie Flask)

```

### Baza danych (PostgreSQL)

### Tabela `users`

| Kolumna      | Typ danych   | Opis                      |
|--------------|--------------|---------------------------|
| `id`         | `INT`        | Unikalny identyfikator użytkownika, AUTO_INCREMENT |
| `name`       | `VARCHAR`    | Imię użytkownika          |
| `age`        | `INT`        | Wiek użytkownika          |
| `image`      | `TEXT`       | Link do zdjęcia użytkownika |
| `description`| `TEXT`       | Krótki opis użytkownika   |

### Tabela `messages`

| Kolumna      | Typ danych   | Opis                              |
|--------------|--------------|-----------------------------------|
| `id`         | `INT`        | Unikalny identyfikator wiadomości, AUTO_INCREMENT |
| `sender_id`  | `INT`        | Identyfikator nadawcy (FK do tabeli `users`) |
| `receiver_id`| `INT`        | Identyfikator odbiorcy (FK do tabeli `users`) |
| `message`    | `TEXT`       | Treść wiadomości                  |
| `timestamp`  | `TIMESTAMP`  | Czas wysłania wiadomości          |

### Tabela `matches`

| Kolumna      | Typ danych   | Opis                              |
|--------------|--------------|-----------------------------------|
| `id`         | `INT`        | Unikalny identyfikator dopasowania, AUTO_INCREMENT |
| `user1_id`   | `INT`        | Identyfikator pierwszego użytkownika (FK do tabeli `users`) |
| `user2_id`   | `INT`        | Identyfikator drugiego użytkownika (FK do tabeli `users`) |
| `matched_at` | `TIMESTAMP`  | Czas dopasowania                  |


## Autorzy
- Kinga Surma
- Radoslav Andrievich Bronkovich
- Kacper Pabian (Ardent Amelka)
