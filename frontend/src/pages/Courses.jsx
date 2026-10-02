import { useMemo, useState } from 'react';
import PublicLayout from '../components/PublicLayout.jsx';
import CourseCard from '../components/CourseCard.jsx';
import { useData } from '../context/DataContext.jsx';
import { categories } from '../api/mockData';

export default function Courses() {
  const { courses, loading } = useData();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    let result = courses;
    if (activeCategory !== 'All') {
      result = result.filter((c) => c.category === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)
      );
    }
    return result;
  }, [courses, search, activeCategory]);

  return (
    <PublicLayout>
      <section className="section container">
        <div className="page-title-row">
          <div>
            <h1 style={{ fontSize: '2rem' }}>Explore courses</h1>
            <p className="muted">Find a course by title, instructor, or category.</p>
          </div>
          <div className="search-bar">
            <span aria-hidden="true">&#128269;</span>
            <input
              type="text"
              placeholder="Search courses or instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="category-pills mt-16" style={{ marginBottom: 28 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="muted">Loading courses...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {courses.length === 0 ? (
              <>
                <h3>No courses on the platform yet</h3>
                <p>Once an admin adds a course, it&rsquo;ll appear here.</p>
              </>
            ) : (
              <>
                <h3>No courses match your search</h3>
                <p>Try a different keyword or category.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
