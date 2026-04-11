// WHAT THIS FILE DOES:
// Defines 3 sample databases as SQL strings.
// When user picks a database, we run these SQL statements
// to create tables and fill them with data — all in memory.

export const DATABASES = {
  students: {
    name: "Students DB",
    icon: "🎓",
    description: "University students, courses, and grades",
    color: "text-blue-400",
    schema: `
      CREATE TABLE students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        department TEXT,
        gpa REAL,
        year INTEGER
      );

      CREATE TABLE courses (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        credits INTEGER,
        professor TEXT
      );

      CREATE TABLE enrollments (
        student_id INTEGER,
        course_id INTEGER,
        grade TEXT,
        semester TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(course_id) REFERENCES courses(id)
      );

      INSERT INTO students VALUES
        (1, 'Arjun Kumar',    21, 'CSE', 8.7, 3),
        (2, 'Priya Sharma',   20, 'ECE', 9.1, 2),
        (3, 'Rahul Verma',    22, 'CSE', 7.8, 4),
        (4, 'Sneha Patel',    21, 'IT',  8.3, 3),
        (5, 'Karan Singh',    23, 'CSE', 9.4, 4),
        (6, 'Ananya Reddy',   20, 'ECE', 8.0, 2),
        (7, 'Vikram Nair',    22, 'IT',  7.5, 3),
        (8, 'Divya Menon',    21, 'CSE', 8.9, 3),
        (9, 'Rohit Gupta',    23, 'ECE', 7.2, 4),
        (10,'Meera Iyer',     20, 'IT',  9.0, 2);

      INSERT INTO courses VALUES
        (1, 'Data Structures',   'CSE', 4, 'Dr. Ramesh'),
        (2, 'Database Systems',  'CSE', 3, 'Dr. Lakshmi'),
        (3, 'Signal Processing', 'ECE', 4, 'Dr. Suresh'),
        (4, 'Web Development',   'IT',  3, 'Dr. Pradeep'),
        (5, 'Machine Learning',  'CSE', 4, 'Dr. Anita'),
        (6, 'Operating Systems', 'CSE', 4, 'Dr. Ramesh');

      INSERT INTO enrollments VALUES
        (1,1,'A','2024-1'), (1,2,'B','2024-1'), (1,5,'A','2024-2'),
        (2,3,'A','2024-1'), (2,4,'A','2024-2'),
        (3,1,'B','2024-1'), (3,6,'A','2024-2'),
        (4,4,'A','2024-1'), (4,2,'B','2024-2'),
        (5,1,'A','2024-1'), (5,5,'A','2024-2'), (5,6,'A','2024-1'),
        (6,3,'B','2024-1'), (7,4,'A','2024-2'),
        (8,1,'A','2024-1'), (8,2,'A','2024-2'),
        (9,3,'C','2024-1'), (10,4,'A','2024-1');
    `,
    sampleQueries: [
      {
        label: "All students",
        sql: "SELECT * FROM students ORDER BY gpa DESC;",
      },
      {
        label: "CSE students GPA > 8",
        sql: "SELECT name, gpa FROM students WHERE department='CSE' AND gpa > 8 ORDER BY gpa DESC;",
      },
      {
        label: "Students per department",
        sql: "SELECT department, COUNT(*) as total, ROUND(AVG(gpa),2) as avg_gpa FROM students GROUP BY department;",
      },
      {
        label: "JOIN — Student courses",
        sql: `SELECT s.name, c.name as course, e.grade
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
ORDER BY s.name;`,
      },
      {
        label: "Top scorers",
        sql: "SELECT name, department, gpa FROM students ORDER BY gpa DESC LIMIT 5;",
      },
    ],
  },

  ecommerce: {
    name: "E-Commerce DB",
    icon: "🛒",
    description: "Products, orders, and customers",
    color: "text-emerald-400",
    schema: `
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        city TEXT,
        email TEXT,
        joined_year INTEGER
      );

      CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT,
        category TEXT,
        price REAL,
        stock INTEGER
      );

      CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        order_date TEXT,
        status TEXT,
        FOREIGN KEY(customer_id) REFERENCES customers(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      );

      INSERT INTO customers VALUES
        (1,'Amit Shah','Mumbai','amit@email.com',2022),
        (2,'Sita Devi','Delhi','sita@email.com',2021),
        (3,'Ravi Kumar','Bangalore','ravi@email.com',2023),
        (4,'Pooja Jain','Chennai','pooja@email.com',2022),
        (5,'Nikhil Das','Kolkata','nikhil@email.com',2021);

      INSERT INTO products VALUES
        (1,'Laptop','Electronics',55000,10),
        (2,'Phone','Electronics',25000,25),
        (3,'T-Shirt','Clothing',499,100),
        (4,'Jeans','Clothing',1299,50),
        (5,'Headphones','Electronics',3500,30),
        (6,'Backpack','Accessories',1999,40),
        (7,'Watch','Accessories',8999,15),
        (8,'Tablet','Electronics',35000,12);

      INSERT INTO orders VALUES
        (1,1,1,1,'2024-01-15','Delivered'),
        (2,1,5,2,'2024-01-20','Delivered'),
        (3,2,3,5,'2024-02-01','Delivered'),
        (4,2,2,1,'2024-02-10','Shipped'),
        (5,3,6,1,'2024-02-15','Delivered'),
        (6,3,7,1,'2024-03-01','Processing'),
        (7,4,4,3,'2024-03-05','Delivered'),
        (8,5,8,1,'2024-03-10','Shipped'),
        (9,1,3,2,'2024-03-12','Delivered'),
        (10,4,2,2,'2024-03-15','Processing');
    `,
    sampleQueries: [
      {
        label: "All products",
        sql: "SELECT * FROM products ORDER BY price DESC;",
      },
      {
        label: "Revenue per category",
        sql: `SELECT p.category,
  COUNT(o.id) as orders,
  SUM(o.quantity * p.price) as revenue
FROM orders o
JOIN products p ON p.id = o.product_id
GROUP BY p.category
ORDER BY revenue DESC;`,
      },
      {
        label: "Customer order history",
        sql: `SELECT c.name, p.name as product, o.quantity, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN products p ON p.id = o.product_id
ORDER BY c.name;`,
      },
      {
        label: "Low stock alert",
        sql: "SELECT name, category, stock FROM products WHERE stock < 20 ORDER BY stock;",
      },
    ],
  },

  hospital: {
    name: "Hospital DB",
    icon: "🏥",
    description: "Patients, doctors, and appointments",
    color: "text-rose-400",
    schema: `
      CREATE TABLE doctors (
        id INTEGER PRIMARY KEY,
        name TEXT,
        specialization TEXT,
        experience INTEGER,
        fee INTEGER
      );

      CREATE TABLE patients (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER,
        blood_group TEXT,
        city TEXT
      );

      CREATE TABLE appointments (
        id INTEGER PRIMARY KEY,
        patient_id INTEGER,
        doctor_id INTEGER,
        date TEXT,
        diagnosis TEXT,
        status TEXT,
        FOREIGN KEY(patient_id) REFERENCES patients(id),
        FOREIGN KEY(doctor_id) REFERENCES doctors(id)
      );

      INSERT INTO doctors VALUES
        (1,'Dr. Sharma','Cardiology',15,1500),
        (2,'Dr. Nair','Neurology',12,2000),
        (3,'Dr. Patel','Orthopedics',8,1200),
        (4,'Dr. Reddy','Dermatology',10,800),
        (5,'Dr. Iyer','General',5,500);

      INSERT INTO patients VALUES
        (1,'Suresh Kumar',45,'O+','Mysuru'),
        (2,'Latha Devi',38,'A+','Bangalore'),
        (3,'Manjunath',55,'B+','Mysuru'),
        (4,'Kavitha',29,'AB+','Hassan'),
        (5,'Prakash',62,'O-','Bangalore');

      INSERT INTO appointments VALUES
        (1,1,1,'2024-01-10','Hypertension','Completed'),
        (2,2,4,'2024-01-12','Skin allergy','Completed'),
        (3,3,2,'2024-01-15','Migraine','Completed'),
        (4,4,5,'2024-02-01','Fever','Completed'),
        (5,5,1,'2024-02-05','Chest pain','Completed'),
        (6,1,3,'2024-02-10','Knee pain','Scheduled'),
        (7,2,1,'2024-03-01','Followup','Scheduled'),
        (8,5,2,'2024-03-05','Headache','Scheduled');
    `,
    sampleQueries: [
      {
        label: "All doctors",
        sql: "SELECT * FROM doctors ORDER BY experience DESC;",
      },
      {
        label: "Appointments per doctor",
        sql: `SELECT d.name, d.specialization, COUNT(a.id) as appointments
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
GROUP BY d.id ORDER BY appointments DESC;`,
      },
      {
        label: "Patient appointments",
        sql: `SELECT p.name as patient, d.name as doctor,
  a.date, a.diagnosis, a.status
FROM appointments a
JOIN patients p ON p.id = a.patient_id
JOIN doctors d ON d.id = a.doctor_id;`,
      },
    ],
  },
};