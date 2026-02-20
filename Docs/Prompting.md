file ini digunakan untuk memberikan instruksi kepada AI dalam mengembangkan aplikasi web budgeting bulanan berbasis Next.js (App Router) dengan arsitektur modular dan terstruktur.

# Variabel :
Docs\list_modul.md

# Perintah :

Anda adalah seorang software engineer yang bertugas untuk membangun aplikasi web budgeting bulanan menggunakan Next.js (App Router). Gunakan bahasa Indonesia sebagai bahasa default untuk percakapan dan dokumentasi teknis.

Aplikasi ini bersifat personal (single user) dan berfokus pada pengelolaan keuangan bulanan berbasis periode (month-based system).

Berikut adalah tugas yang harus dilakukan:

1. Rancang arsitektur sistem berbasis entitas Month sebagai pusat data.
2. Implementasikan modul Month Management dengan fitur:

   * Membuat bulan baru
   * Menentukan starting balance
   * Status active / closed
   * Riwayat bulan sebelumnya
3. Implementasikan modul Accounts:

   * CRUD akun (Cash, Bank, E-Wallet)
   * Tracking saldo per akun
   * Transfer antar akun
4. Implementasikan modul Transactions:

   * Input pemasukan dan pengeluaran
   * Kategori transaksi
   * Pemilihan akun
   * Relasi ke bulan aktif
   * Edit dan hapus transaksi
5. Implementasikan modul Budget Planner per bulan:

   * Set limit per kategori
   * Tracking penggunaan
   * Indikator overbudget
6. Implementasikan Dashboard:

   * Total balance
   * Total income & expense bulan aktif
   * Remaining balance
   * Budget usage progress
   * Distribusi pengeluaran per kategori (diagram)
   * Burn rate indicator
7. Implementasikan Debt Tracker:

   * Total hutang
   * Cicilan bulanan
   * Sisa hutang
   * Progress pelunasan
8. Implementasikan Savings Goals:

   * Target nominal
   * Target waktu
   * Progress tracking
9. Pastikan seluruh transaksi terikat pada bulan aktif dan tidak bercampur antar periode.
10. Implementasikan sistem closing month yang mengunci data bulan yang sudah selesai.
11. Gunakan struktur database yang terpisah untuk:

    * Users (jika diperlukan)
    * Months
    * Accounts
    * Transactions
    * Budgets
    * Debts
    * SavingsGoals
12. Pastikan setiap perubahan transaksi otomatis memperbarui saldo akun dan ringkasan dashboard.
13. Gunakan clean architecture dan pisahkan logic bisnis dari komponen UI.
14. Dokumentasikan setiap modul dan relasi antar entitas.

Jika terdapat asumsi yang belum jelas, jelaskan
Semua harus berdasarkan yang ada pada Docs\list_modul.md 
