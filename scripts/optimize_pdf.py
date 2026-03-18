import os
import subprocess
import glob
from pathlib import Path

# Yêu cầu cài đặt QPDF trước khi chạy script này:
# Windows: winget install qpdf
# Chạy script bằng: python scripts/optimize_pdf.py

INPUT_DIR = "pdf_input"
OUTPUT_DIR = "pdf_output"

def setup_directories():
    if not os.path.exists(INPUT_DIR):
        os.makedirs(INPUT_DIR)
        print(f"Created input directory: {INPUT_DIR}")
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created output directory: {OUTPUT_DIR}")

def optimize_pdf_lossless():
    setup_directories()
    
    pdf_files = glob.glob(os.path.join(INPUT_DIR, "*.pdf"))
    
    if not pdf_files:
        print(f"❌ Không tìm thấy file PDF nào trong thư mục '{INPUT_DIR}'")
        print(f"👉 Vui lòng copy các file PDF cần nén vào '{INPUT_DIR}' và chạy lại script.")
        return

    print(f"🔍 Bắt đầu tối ưu Lossless cho {len(pdf_files)} file PDF đề toán/công thức...")
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        output_path = os.path.join(OUTPUT_DIR, filename)
        
        # Lệnh QPDF: 
        # --linearize: Tối ưu cho Web Fast View
        # --object-streams=generate: Nén cấu trúc object
        # --recompress-flate: Nén lại các luồng dữ liệu Flate mà KHÔNG MẤT CHẤT LƯỢNG (Lossless)
        command = [
            "qpdf",
            "--linearize",
            "--object-streams=generate",
            "--recompress-flate",
            pdf_path,
            output_path
        ]
        
        try:
            print(f"⏳ Process: {filename}...")
            # Kiểm tra xem QPDF có cài trong máy không
            try:
                subprocess.run(["qpdf", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            except (subprocess.CalledProcessError, FileNotFoundError):
                print("❌ LỖI: Không tìm thấy lệnh 'qpdf' trong hệ thống.")
                print("👉 Hướng dẫn (Windows): Mở Terminal bằng Run as Administrator và gõ lệnh: winget install qpdf")
                print("👉 Sau đó khởi động lại Terminal và chạy lại script này.")
                return

            # Chạy nén
            process = subprocess.run(command, capture_output=True, text=True, check=True)
            
            # Tính toán % giảm
            old_size = os.path.getsize(pdf_path) / 1024 # KB
            new_size = os.path.getsize(output_path) / 1024 # KB
            reduction = ((old_size - new_size) / old_size) * 100 if old_size > 0 else 0
            
            print(f"   ✅ Xong: {old_size:.1f} KB -> {new_size:.1f} KB (Giảm {reduction:.1f}%)")
            
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Lỗi bảo mật/hỏng file {filename}: {e.stderr}")
        except Exception as e:
            print(f"   ❌ Lỗi không xác định: {str(e)}")
            
    print("\n🎉 Hoàn tất quá trình tối ưu đề Toán!")
    print(f"Thư mục chứa kết quả: {os.path.abspath(OUTPUT_DIR)}")

if __name__ == "__main__":
    print("==============================================")
    print("  MATH PDF OPTIMIZER (LOSSLESS) by ANTIGRAVITY")
    print("==============================================")
    optimize_pdf_lossless()
