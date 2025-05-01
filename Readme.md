# IlliniSpaces (CS 411 Final Project)

**IlliniSpaces** is a web-based platform designed to help students and organizations at the University of Illinois efficiently locate and informally reserve available meeting rooms on campus. Users can search by building, room capacity, amenities, and availability.

This project was built as part of the CS 411 (Database Systems) course at the University of Illinois Urbana-Champaign.

---

## 🚀 Features

- Filter available rooms by building, time, capacity, and amenities
- Make and manage informal room reservations
- Clean user interface with responsive design
- MySQL database with optimized schema
- Mock data for safe and open-source testing

---

## 📁 Repository Structure

```
.
├── backend/                # Flask or backend logic (if applicable)
│   ├── .env.example        # Database & Clerk Credentials
├── illinispaces/           # Web interface (Next.js, HTML, etc.)
│   ├── .env.example        # Clerk Credentials
├── data/
│   ├── Note.md             # Note on dataset creation
│   ├── schema.sql          # Database schema
│   ├── load_mock_data.sql  # Load mock data to database
│   ├── mock_data/          # Example data for each relation
├── setup_db.sh             # Shell script to set up database
├── README.md               # This file
```

---

## ⚠️ Data and Ethics Note

The original version of this project used course scheduling data from a university website. However, we later realized that the site's `robots.txt` explicitly disallows web scraping.

**To comply with ethical data usage practices**, we have:

- Removed all scraped data
- Removed all scraping code
- Included mock data in `data/` for demonstration purposes

For more details, see [`data/Note.md`](data/Note.md).

---

## 🛠 Local Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/jiaqizhao2004/illinispaces.git
   ```
2. Make sure you have MySQL installed.
3. Register for **Clerk Authorization** and obtain `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
4. Create a database named `databased` (or any name).
5. Copy the env file:
   ```bash
   cp backend/.env.example backend/.env
   ```
6. Fill in your database and Clerk credentials in `backend/.env`
7. Run the setup script:
   ```bash
   chmod +x setup_db.sh
   ./setup_db.sh
   ```
8. Run backend
   ```bash
   cd backend
   python app.py
   ```

9. Copy the env file for frontend:
   ```bash
   cp illinispaces/.env.example illinispaces/.env
   ```
10. Fill in your **Clerk** credentials in `illinispaces/.env`
11. Run frontend
   ```bash
   cd illinispaces
   npm install
   npm run dev
   ```

This will load the schema and mock data so you can test the app locally.

## 👥 Authors

- Nehan Tarefdar
- Roy Zhao
- Atsi Gupta
- Somrishi Banerjee

Project for **CS 411: Database Systems**  
Instructor: Abdu Alawini  
TA: Aadarsh Hegde  
University of Illinois Urbana-Champaign

---

## 📜 License

This project is for educational purposes only. Do not use or redistribute the original course data without proper permissions.

