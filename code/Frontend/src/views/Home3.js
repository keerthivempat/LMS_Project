import { Hero } from "../components/Hero";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Book, Users, Award, ArrowRight } from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("accessToken") !== null);
  }, []);

  const reviews = [
    {
      id: 1,
      name: "Aarav Mehta",
      review: "Eklavya Foundation transformed my career! The guidance and mentorship I received were invaluable.",
      rating: 5,
    },
    {
      id: 2,
      name: "Priya Sharma",
      review: "The best platform for first-gen students. I got a scholarship and mentorship that changed my life.",
      rating: 5,
    },
    {
      id: 3,
      name: "Rahul Verma",
      review: "The support and opportunities provided here are unparalleled. Truly life-changing experience!",
      rating: 4.5,
    },
  ];

  const features = [
    {
      icon: <Book className="w-8 h-8 text-yellow" />,
      title: "Curated Courses",
      description: "Access high-quality courses designed specifically for first-generation learners"
    },
    {
      icon: <Users className="w-8 h-8 text-yellow" />,
      title: "Expert Mentorship",
      description: "Connect with experienced mentors who guide you through your educational journey"
    },
    {
      icon: <Award className="w-8 h-8 text-yellow" />,
      title: "Scholarships",
      description: "Explore scholarship opportunities to support your higher education goals"
    }
  ];

  return (
    <main className="min-h-screen bg-cream">
      <div>
        <Hero isLoggedIn={isLoggedIn} />

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "10,000+", label: "Students Empowered" },
              { number: "500+", label: "Success Stories" },
              { number: "100+", label: "Partner Organizations" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-brown/10 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-3xl font-bold text-brown">{stat.number}</h3>
                <p className="text-gray-700">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What We Do Section */}
        <section className="container mx-auto px-4 py-16 bg-white/50">
          <motion.h2
            className="text-4xl font-bold text-brown mb-12 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Empowering First-Generation Learners
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-brown mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="bg-brown/5 p-8 rounded-lg border-l-4 border-yellow"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-700 leading-relaxed">
              <span className="font-semibold text-brown">Eklavya India Foundation</span> empowers first-generation university students from historically marginalized communities. We facilitate their successful career transitions through world-class higher education opportunities.
            </p>
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            className="bg-brown text-white p-12 rounded-lg text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8">Join thousands of students who have transformed their lives through education</p>
            <button className="bg-yellow text-brown px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:bg-yellow/90 transition-colors" onClick = {()=>{
              window.location.href = "/home"
            }}>
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </section>

        {/* Reviews Section */}
        <section className="container mx-auto px-4 py-16 bg-white/50">
          <motion.h2
            className="text-4xl font-bold text-brown mb-6 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            What Our Students Say
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="bg-white p-6 rounded shadow-md hover:shadow-lg transition duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3">
                  <Quote className="text-yellow w-8 h-8" />
                  <h3 className="text-xl font-semibold text-brown">{review.name}</h3>
                </div>
                <p className="text-gray-700 mt-3">{review.review}</p>
                <div className="flex mt-4">
                  {[...Array(Math.floor(review.rating))].map((_, i) => (
                    <Star key={i} className="text-yellow w-5 h-5" fill="currentColor" />
                  ))}
                  {review.rating % 1 !== 0 && <Star className="text-yellow w-5 h-5 opacity-50" />}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-brown text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About Us</h3>
              <p className="text-white/80">Empowering first-generation learners through education and mentorship.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-yellow">Programs</a></li>
                <li><a href="#" className="text-white/80 hover:text-yellow">Scholarships</a></li>
                <li><a href="#" className="text-white/80 hover:text-yellow">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-white/80">contact@eklavya.org</li>
                <li className="text-white/80">+91 XXX XXX XXXX</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {/* Add social media icons here */}
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/80">© {new Date().getFullYear()} Eklavya India Foundation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
