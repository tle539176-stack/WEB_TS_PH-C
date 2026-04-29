import { motion } from 'motion/react';
import { Award, GraduationCap, Stethoscope, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Về Bác sĩ Wynn Tran</h1>
            <div className="w-20 h-1 bg-[#0A3151] mx-auto mb-8" />
            <p className="text-xl text-neutral-600 italic">"Kiến thức là cách tốt nhất quý vị bảo vệ chính mình!"</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-2xl shadow-xl aspect-[3/4]"
            >
              <img
                src="https://picsum.photos/seed/drwynn/600/800"
                alt="Dr. Wynn Tran Profile"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold font-serif text-[#0A3151]">Câu chuyện của tôi</h2>
              <p className="text-neutral-600 leading-relaxed">
                Bác sĩ Wynn Tran (Trần Huỳnh) hiện là bác sĩ chuyên khoa tại Hoa Kỳ. Anh được biết đến rộng rãi qua các chương trình Livestream chia sẻ kiến thức y khoa trên kênh Youtube Dr. Wynn Tran Official.
              </p>
              <p className="text-neutral-600 leading-relaxed">
                Hành trình từ một kiến trúc sư chuyển sang ngành y tại Mỹ là một minh chứng cho sự nỗ lực không ngừng nghỉ và đam mê phục vụ cộng đồng.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-5 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-[#0A3151]">15+</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Năm kinh nghiệm</p>
                </div>
                <div className="p-5 bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-2xl font-bold text-[#0A3151]">500k+</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Người theo dõi</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap className="w-6 h-6 text-[#0A3151]" />
                <h3 className="text-2xl font-bold font-serif">Học vấn & Bằng cấp</h3>
              </div>
              <div className="space-y-6">
                {[
                  { degree: 'Bác sĩ Y khoa (MD)', school: 'Hoa Kỳ', year: '2010' },
                  { degree: 'Chuyên khoa Nội tổng quát', school: 'Hoa Kỳ', year: '2014' },
                  { degree: 'Kiến trúc sư', school: 'Đại học Kiến trúc TP.HCM', year: '2000' }
                ].map((edu, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white rounded-xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow hover:border-[#0A3151]/20">
                    <div>
                      <h4 className="font-bold text-lg">{edu.degree}</h4>
                      <p className="text-neutral-500">{edu.school}</p>
                    </div>
                    <span className="text-[#0A3151] font-bold">{edu.year}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-6 h-6 text-[#0A3151]" />
                <h3 className="text-2xl font-bold font-serif">Hoạt động cộng đồng</h3>
              </div>
              <div className="bg-[#0A3151] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
                <p className="leading-relaxed mb-6">
                  Sáng lập tổ chức VietMD.NET giúp sinh viên Y khoa Việt Nam hội nhập y khoa thế giới. Giảng dạy tiếng Anh chuyên ngành y khoa và chia sẻ kinh nghiệm thực hành lâm sàng.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['VietMD.NET', 'Youtube Official', 'Facebook Community', 'Medical Education'].map((tag, i) => (
                    <span key={i} className="px-4 py-2 bg-white/10 rounded-full text-xs font-medium hover:bg-white/20 transition-colors cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
