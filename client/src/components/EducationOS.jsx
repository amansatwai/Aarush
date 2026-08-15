import { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Flame,
  GraduationCap,
  HelpCircle,
  Layers3,
  ListChecks,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Timer,
  Trophy,
  X,
} from 'lucide-react';

const MODULES = [
  ['overview', 'Overview', GraduationCap],
  ['courses', 'My Courses', BookOpen],
  ['subjects', 'Subjects', Layers3],
  ['tutor', 'AI Tutor', Sparkles],
  ['notes', 'Notes', FileText],
  ['flashcards', 'Flashcards', RotateCcw],
  ['quizzes', 'Quizzes', ListChecks],
  ['assignments', 'Assignments', Check],
  ['exams', 'Exams', Award],
  ['planner', 'Study Planner', CalendarDays],
  ['analytics', 'Analytics', BarChart3],
];

const SUBJECT_NAMES = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Business',
  'Programming',
  'Design',
];

const ASSIGNMENT_STATUSES = [
  'Pending',
  'In Progress',
  'Submitted',
  'Reviewed',
  'Completed',
];

function numeric(value) {
  return Number(value) || 0;
}

function formatDate(value) {
  if (!value) return 'Not set';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function normalizeCourse(course, index) {
  return {
    ...course,
    id: course?.id || `course-${index}`,
    title: course?.title || course?.name || 'Course',
    instructor: course?.instructor || 'Instructor foundation',
    progress: numeric(course?.progress),
    duration: course?.duration || 'Self-paced',
    lastAccessed: course?.lastAccessed || null,
    category: course?.category || 'General',
  };
}

function normalizeAssignment(assignment, index) {
  return {
    ...assignment,
    id: assignment?.id || `assignment-${index}`,
    title:
      assignment?.title ||
      assignment?.name ||
      'Assignment',
    status: assignment?.status || 'Pending',
    dueDate: assignment?.dueDate || assignment?.deadline || null,
    subject: assignment?.subject || 'General',
  };
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color = '#4dd7ff',
}) {
  return (
    <article style={styles.metricCard}>
      <span
        style={{
          ...styles.metricIcon,
          color,
          background: `${color}18`,
        }}
      >
        <Icon size={17} />
      </span>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </article>
  );
}

function SectionTitle({ title, subtitle, icon: Icon, action }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      {action || <Icon size={18} color="#4dd7ff" />}
    </div>
  );
}

export default function EducationOS({
  user = {},
  courses = [],
  subjects = [],
  lessons = [],
  notes = [],
  quizzes = [],
  flashcards = [],
  assignments = [],
  exams = [],
  studyPlan = {},
  progress = {},
  onOpenCourse,
  onOpenLesson,
  onStartQuiz,
  onCreateNote,
  onClose,
}) {
  const [activeModule, setActiveModule] =
    useState('overview');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] =
    useState('All');
  const [assignmentStatus, setAssignmentStatus] =
    useState('All');
  const [notice, setNotice] = useState('');
  const [noteModal, setNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [flashcardIndex, setFlashcardIndex] =
    useState(0);

  const normalizedCourses = useMemo(
    () => courses.map(normalizeCourse),
    [courses]
  );

  const normalizedAssignments = useMemo(
    () => assignments.map(normalizeAssignment),
    [assignments]
  );

  const subjectItems = useMemo(
    () =>
      subjects.length
        ? subjects
        : SUBJECT_NAMES.map((name, index) => ({
            id: `subject-${index}`,
            name,
            progress: 0,
          })),
    [subjects]
  );

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedCourses.filter((course) => {
      const matchesSearch =
        !query ||
        [
          course.title,
          course.instructor,
          course.category,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesSubject =
        subjectFilter === 'All' ||
        course.category === subjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [normalizedCourses, search, subjectFilter]);

  const filteredAssignments = useMemo(
    () =>
      normalizedAssignments.filter(
        (assignment) =>
          assignmentStatus === 'All' ||
          assignment.status === assignmentStatus
      ),
    [assignmentStatus, normalizedAssignments]
  );

  const pendingAssignments = useMemo(
    () =>
      normalizedAssignments.filter(
        (assignment) =>
          !['Completed', 'Reviewed'].includes(
            assignment.status
          )
      ).length,
    [normalizedAssignments]
  );

  const currentFlashcard =
    flashcards[flashcardIndex % Math.max(flashcards.length, 1)];

  const showNotice = (message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice('');
    }, 2400);
  };

  const createNote = () => {
    if (!noteTitle.trim()) {
      showNotice('Enter a note title.');
      return;
    }

    onCreateNote?.({
      id: `note-${Date.now()}`,
      title: noteTitle.trim(),
      type: 'Study note',
      createdBy: user.id,
      aiSummary: true,
    });

    setNoteTitle('');
    setNoteModal(false);
    showNotice('Study note created.');
  };

  const askTutor = () => {
    if (!tutorPrompt.trim()) {
      showNotice('Enter a question for AI Tutor.');
      return;
    }

    showNotice('AI Tutor response prepared.');
  };

  const renderOverview = () => (
    <>
      <section style={styles.educationHero}>
        <div style={styles.educationOrb}>
          <GraduationCap size={32} />
        </div>
        <div style={styles.educationCopy}>
          <span style={styles.aiBadge}>
            <Sparkles size={12} />
            Aarush EducationOS
          </span>
          <h1>
            Keep learning,{' '}
            {user.firstName ||
              user.name?.split?.(' ')?.[0] ||
              'every day'}
          </h1>
          <p>
            Learn with AI tutoring, structured courses, smart
            revision, practice, and personalized study planning.
          </p>
          <div style={styles.heroMeta}>
            <span>
              <Flame size={13} />
              {progress.streak || 0} day streak
            </span>
            <span>
              <Sparkles size={13} />
              Mastery:{' '}
              {progress.aiMasteryScore || 0}%
            </span>
          </div>
        </div>
      </section>

      <section style={styles.metricGrid}>
        <MetricCard
          label="Active courses"
          value={normalizedCourses.length}
          icon={BookOpen}
          color="#4dd7ff"
        />
        <MetricCard
          label="Lessons completed"
          value={numeric(progress.lessonsCompleted)}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Study hours"
          value={progress.studyHours || 0}
          icon={Clock3}
          color="#a895ff"
        />
        <MetricCard
          label="Streak"
          value={`${progress.streak || 0} days`}
          icon={Flame}
          color="#ff9f72"
        />
        <MetricCard
          label="Upcoming exams"
          value={exams.length}
          icon={Award}
          color="#ffd27d"
        />
        <MetricCard
          label="Pending assignments"
          value={pendingAssignments}
          icon={ListChecks}
          color="#ff4fd8"
        />
        <MetricCard
          label="AI mastery"
          value={`${progress.aiMasteryScore || 0}%`}
          icon={Sparkles}
          color="#9deeff"
        />
        <MetricCard
          label="Weekly progress"
          value={`${progress.weeklyProgress || 0}%`}
          icon={BarChart3}
          color="#82e9c1"
        />
      </section>

      <section style={styles.section}>
        <SectionTitle
          title="Continue Learning"
          subtitle="Pick up where you left off."
          icon={Play}
        />

        <div style={styles.courseGrid}>
          {normalizedCourses.slice(0, 3).map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpen={() => onOpenCourse?.(course)}
            />
          ))}
        </div>
      </section>
    </>
  );

  const renderCourses = () => (
    <section style={styles.section}>
      <SectionTitle
        title="My Courses"
        subtitle="Your enrolled courses and learning progress."
        icon={BookOpen}
      />

      <div style={styles.searchBox}>
        <Search size={16} />
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search courses"
          aria-label="Search courses"
          style={styles.searchInput}
        />
      </div>

      <div style={styles.filterRow}>
        {['All', ...subjectItems.map((item) => item.name)].map(
          (filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setSubjectFilter(filter)}
              aria-pressed={subjectFilter === filter}
              style={{
                ...styles.filterButton,
                ...(subjectFilter === filter
                  ? styles.activeFilterButton
                  : {}),
              }}
            >
              {filter}
            </button>
          )
        )}
      </div>

      <div style={styles.courseGrid}>
        {filteredCourses.length ? (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpen={() => onOpenCourse?.(course)}
            />
          ))
        ) : (
          <Empty label="No courses found." />
        )}
      </div>
    </section>
  );

  const renderSubjects = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Subjects"
        subtitle="Organize learning by subject and mastery."
        icon={Layers3}
      />

      <div style={styles.subjectGrid}>
        {subjectItems.map((subject, index) => (
          <button
            type="button"
            key={subject.id || index}
            onClick={() =>
              showNotice(`${subject.name} selected.`)
            }
            style={styles.subjectCard}
          >
            <span style={styles.subjectIcon}>
              <Layers3 size={17} />
            </span>
            <strong>{subject.name}</strong>
            <div style={styles.progressTrack}>
              <span
                style={{
                  ...styles.progressFill,
                  width: `${numeric(subject.progress)}%`,
                }}
              />
            </div>
            <small>
              {numeric(subject.progress)}% mastery
            </small>
          </button>
        ))}
      </div>
    </section>
  );

  const renderTutor = () => (
    <section style={styles.section}>
      <SectionTitle
        title="AI Tutor"
        subtitle="Ask, understand, practice, and prepare."
        icon={Sparkles}
      />

      <div style={styles.tutorHero}>
        <Sparkles size={21} />
        <div>
          <strong>
            What would you like to learn today?
          </strong>
          <span>
            Aarush AI can use your courses, notes, and progress
            context.
          </span>
        </div>
      </div>

      <div style={styles.tutorGrid}>
        {[
          'Ask a Question',
          'Explain Concept',
          'Solve Problem',
          'Step-by-Step Solution',
          'Translate Explanation',
          'Simplify Topic',
          'Create Practice Questions',
          'Create Summary',
          'Exam Preparation',
          'Homework Help',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() => setTutorPrompt(label)}
            style={styles.tutorAction}
          >
            <Sparkles size={15} />
            {label}
            <ChevronRight
              size={14}
              style={{ marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>

      <div style={styles.tutorComposer}>
        <input
          value={tutorPrompt}
          onChange={(event) =>
            setTutorPrompt(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') askTutor();
          }}
          placeholder="Ask your AI Tutor..."
          aria-label="Ask AI Tutor"
          style={styles.composerInput}
        />
        <button
          type="button"
          onClick={askTutor}
          style={styles.sendButton}
          aria-label="Ask AI Tutor"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </section>
  );

  const renderNotes = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Study Notes"
        subtitle="Capture, organize, and improve your notes with AI."
        icon={FileText}
        action={
          <button
            type="button"
            onClick={() => setNoteModal(true)}
            style={styles.smallPrimary}
          >
            <Plus size={14} />
            New note
          </button>
        }
      />

      <div style={styles.noteTools}>
        {[
          'Rich text',
          'Images foundation',
          'Diagrams foundation',
          'Equations foundation',
          'Checklists',
          'AI summaries',
          'AI rewrite',
        ].map((label) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} enabled.`)
            }
            style={styles.toolChip}
          >
            <FileText size={14} />
            {label}
          </button>
        ))}
      </div>

      <div style={styles.noteList}>
        {notes.length ? (
          notes.map((note, index) => (
            <div
              key={note.id || index}
              style={styles.noteCard}
            >
              <div style={styles.noteTop}>
                <FileText size={16} />
                <span>
                  {note.tag || note.subject || 'Study'}
                </span>
              </div>
              <strong>
                {note.title || note.name || 'Study note'}
              </strong>
              <p>
                {note.content ||
                  note.text ||
                  'Note content foundation'}
              </p>
              <small>
                {note.linkedLesson || 'Linked lesson foundation'}
              </small>
            </div>
          ))
        ) : (
          <Empty label="No study notes yet." />
        )}
      </div>
    </section>
  );

  const renderFlashcards = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Flashcards"
        subtitle="Spaced repetition and AI-generated revision."
        icon={RotateCcw}
        action={
          <button
            type="button"
            onClick={() =>
              showNotice('AI flashcard generation prepared.')
            }
            style={styles.smallPrimary}
          >
            <Sparkles size={14} />
            Generate
          </button>
        }
      />

      <div style={styles.flashcard}>
        <span style={styles.flashcardLabel}>
          {currentFlashcard?.subject || 'Subject'}
        </span>
        <strong>
          {currentFlashcard?.front ||
            'Flashcard front preview'}
        </strong>
        <p>
          {currentFlashcard?.back ||
            'Reveal the answer and rate your mastery.'}
        </p>
        <small>
          Difficulty:{' '}
          {currentFlashcard?.difficulty || 'Medium'} · Next
          review:{' '}
          {formatDate(currentFlashcard?.nextReview)}
        </small>
      </div>

      <div style={styles.flashcardActions}>
        <button
          type="button"
          onClick={() =>
            setFlashcardIndex((value) => value + 1)
          }
          style={styles.primaryButton}
        >
          <RotateCcw size={16} />
          Next card
        </button>
        <button
          type="button"
          onClick={() =>
            showNotice('Flashcard editor opened.')
          }
          style={styles.secondaryButton}
        >
          Edit flashcard
        </button>
      </div>

      <div style={styles.metricGrid}>
        <MetricCard
          label="Total cards"
          value={flashcards.length}
          icon={Layers3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Mastered"
          value={numeric(progress.flashcardsMastered)}
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Due today"
          value={numeric(progress.flashcardsDue)}
          icon={Clock3}
          color="#ffd27d"
        />
        <MetricCard
          label="Mastery"
          value={`${progress.flashcardMastery || 0}%`}
          icon={BarChart3}
          color="#a895ff"
        />
      </div>
    </section>
  );

  const renderQuizzes = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Quizzes"
        subtitle="Practice with feedback across question types."
        icon={ListChecks}
      />

      <div style={styles.quizList}>
        {quizzes.length ? (
          quizzes.map((quiz, index) => (
            <button
              type="button"
              key={quiz.id || index}
              onClick={() => onStartQuiz?.(quiz)}
              style={styles.quizRow}
            >
              <span style={styles.quizIcon}>
                <ListChecks size={17} />
              </span>
              <span style={styles.quizCopy}>
                <strong>
                  {quiz.title || quiz.name || 'Practice quiz'}
                </strong>
                <span>
                  {quiz.questions || 0} questions ·{' '}
                  {quiz.type || 'Mixed questions'}
                </span>
                <small>
                  Best score:{' '}
                  {quiz.bestScore || 'Not attempted'}
                </small>
              </span>
              <Play size={15} />
            </button>
          ))
        ) : (
          <Empty label="No quizzes available." />
        )}
      </div>

      <div style={styles.questionTypes}>
        {[
          'Multiple Choice',
          'True / False',
          'Fill in the Blank',
          'Match',
          'Short Answer',
          'Numerical foundation',
        ].map((type) => (
          <span key={type} style={styles.toolChip}>
            <Check size={13} />
            {type}
          </span>
        ))}
      </div>
    </section>
  );

  const renderAssignments = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Assignments"
        subtitle="Track due dates, progress, and AI assistance."
        icon={ListChecks}
      />

      <div style={styles.filterRow}>
        {['All', ...ASSIGNMENT_STATUSES].map((status) => (
          <button
            type="button"
            key={status}
            onClick={() => setAssignmentStatus(status)}
            aria-pressed={assignmentStatus === status}
            style={{
              ...styles.filterButton,
              ...(assignmentStatus === status
                ? styles.activeFilterButton
                : {}),
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={styles.assignmentList}>
        {filteredAssignments.length ? (
          filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              style={styles.assignmentRow}
            >
              <span style={styles.assignmentIcon}>
                <FileText size={16} />
              </span>
              <span style={styles.assignmentCopy}>
                <strong>{assignment.title}</strong>
                <span>
                  {assignment.subject} ·{' '}
                  {assignment.status}
                </span>
                <small>
                  Due {formatDate(assignment.dueDate)}
                </small>
              </span>
              <button
                type="button"
                onClick={() =>
                  showNotice('AI assignment help prepared.')
                }
                style={styles.tinyButton}
                aria-label="Assignment options"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty label="No assignments in this view." />
        )}
      </div>
    </section>
  );

  const renderExams = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Exams"
        subtitle="Prepare with mock tests, syllabus coverage, and readiness."
        icon={Award}
      />

      <div style={styles.examList}>
        {exams.length ? (
          exams.map((exam, index) => (
            <div
              key={exam.id || index}
              style={styles.examCard}
            >
              <span style={styles.examIcon}>
                <Award size={19} />
              </span>
              <strong>
                {exam.title || exam.name || 'Upcoming exam'}
              </strong>
              <span>
                {exam.subject || 'Subject'} ·{' '}
                {formatDate(exam.date)}
              </span>
              <small>
                Time remaining:{' '}
                {exam.timeRemaining || 'Foundation'}
              </small>
              <div style={styles.examStats}>
                <span>
                  Syllabus {numeric(exam.syllabusCoverage)}%
                </span>
                <span>
                  AI readiness {numeric(exam.readinessScore)}%
                </span>
              </div>
            </div>
          ))
        ) : (
          <Empty label="No upcoming exams." />
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          showNotice('Mock test preparation opened.')
        }
        style={styles.primaryButton}
      >
        <Play size={16} />
        Start mock test
      </button>
    </section>
  );

  const renderPlanner = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Study Planner"
        subtitle="Build daily, weekly, and exam-focused schedules."
        icon={CalendarDays}
      />

      <div style={styles.plannerGrid}>
        {[
          ['Daily schedule', CalendarDays],
          ['Weekly schedule', CalendarDays],
          ['Exam countdown', Clock3],
          ['Revision plan', RotateCcw],
          ['Pomodoro foundation', Timer],
          ['AI scheduling', Sparkles],
          ['Goal setting', Target],
        ].map(([label, Icon]) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              showNotice(`${label} opened.`)
            }
            style={styles.plannerCard}
          >
            <Icon size={17} />
            <strong>{label}</strong>
            <span>Ready to configure</span>
          </button>
        ))}
      </div>

      <div style={styles.studyPlanNote}>
        <Sparkles size={16} />
        <span>
          AI suggestion:{' '}
          {studyPlan.recommendation ||
            'Schedule a focused revision block for your weakest topic.'}
        </span>
      </div>
    </section>
  );

  const renderAnalytics = () => (
    <section style={styles.section}>
      <SectionTitle
        title="Progress & Analytics"
        subtitle="Understand mastery, accuracy, and revision needs."
        icon={BarChart3}
      />

      <div style={styles.metricGrid}>
        <MetricCard
          label="Subject progress"
          value={progress.subjectProgress || 'Foundation'}
          icon={Layers3}
          color="#4dd7ff"
        />
        <MetricCard
          label="Time spent"
          value={progress.timeSpent || 'Foundation'}
          icon={Clock3}
          color="#a895ff"
        />
        <MetricCard
          label="Accuracy"
          value={
            progress.accuracy
              ? `${progress.accuracy}%`
              : 'Foundation'
          }
          icon={Check}
          color="#82e9c1"
        />
        <MetricCard
          label="Learning trend"
          value={progress.learningTrend || 'Improving'}
          icon={TrendingIcon}
          color="#ffd27d"
        />
      </div>

      <div style={styles.analyticsList}>
        {[
          ['Weak topics', progress.weakTopics || 'Foundation'],
          ['Strong topics', progress.strongTopics || 'Foundation'],
          ['Revision needs', progress.revisionNeeds || 'Foundation'],
          ['AI recommendations', progress.recommendations || 'Ready'],
        ].map(([label, value]) => (
          <div key={label} style={styles.analyticsRow}>
            <span>{label}</span>
            <strong>{value}</strong>
            <ChevronRight size={14} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderModule = () => {
    if (activeModule === 'overview') return renderOverview();
    if (activeModule === 'courses') return renderCourses();
    if (activeModule === 'subjects') return renderSubjects();
    if (activeModule === 'tutor') return renderTutor();
    if (activeModule === 'notes') return renderNotes();
    if (activeModule === 'flashcards') return renderFlashcards();
    if (activeModule === 'quizzes') return renderQuizzes();
    if (activeModule === 'assignments') {
      return renderAssignments();
    }
    if (activeModule === 'exams') return renderExams();
    if (activeModule === 'planner') return renderPlanner();
    if (activeModule === 'analytics') return renderAnalytics();

    return null;
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close EducationOS"
          style={styles.iconButton}
        >
          <X size={19} />
        </button>

        <div style={styles.heading}>
          <strong>EducationOS</strong>
          <span>
            Learn with clarity, practice with intelligence
          </span>
        </div>

        <button
          type="button"
          aria-label="Education settings"
          style={styles.iconButton}
        >
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div style={styles.content}>
        {notice ? (
          <div role="status" style={styles.notice}>
            <Check size={14} />
            {notice}
          </div>
        ) : null}

        <nav style={styles.moduleNav}>
          {MODULES.map(([id, label, Icon]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveModule(id)}
              aria-pressed={activeModule === id}
              style={{
                ...styles.moduleButton,
                ...(activeModule === id
                  ? styles.activeModuleButton
                  : {}),
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {renderModule()}
      </div>

      {noteModal ? (
        <Modal
          title="Create Study Note"
          onClose={() => setNoteModal(false)}
        >
          <label style={styles.field}>
            Note title
            <input
              autoFocus
              value={noteTitle}
              onChange={(event) =>
                setNoteTitle(event.target.value)
              }
              placeholder="Biology revision notes"
              style={styles.textInput}
            />
          </label>

          <button
            type="button"
            onClick={createNote}
            style={styles.primaryButton}
          >
            <Check size={15} />
            Create note
          </button>
        </Modal>
      ) : null}

      <style>{`
        @keyframes aarush-education-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes aarush-education-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(77,215,255,.18);
          }
          50% {
            box-shadow: 0 0 42px rgba(124,92,255,.52);
          }
        }

        .aarush-education-card:hover,
        .aarush-education-module:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 650px) {
          .aarush-education-nav {
            display: grid !important;
            grid-template-columns: repeat(3,1fr) !important;
          }

          .aarush-education-metrics {
            grid-template-columns: repeat(2,1fr) !important;
          }

          .aarush-education-subjects,
          .aarush-education-courses {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function CourseCard({ course, onOpen }) {
  return (
    <article style={styles.courseCard}>
      {course.thumbnail || course.image ? (
        <img
          src={course.thumbnail || course.image}
          alt={course.title}
          loading="lazy"
          style={styles.courseImage}
        />
      ) : (
        <div style={styles.coursePlaceholder}>
          <BookOpen size={27} />
        </div>
      )}

      <div style={styles.courseBody}>
        <strong>{course.title}</strong>
        <span>{course.instructor}</span>
        <div style={styles.progressTrack}>
          <span
            style={{
              ...styles.progressFill,
              width: `${course.progress}%`,
            }}
          />
        </div>
        <small>
          {course.progress}% · {course.duration}
        </small>
        <button
          type="button"
          onClick={onOpen}
          style={styles.courseButton}
        >
          <Play size={13} />
          Continue
        </button>
      </div>
    </article>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalBackdrop}>
      <section style={styles.modal}>
        <div style={styles.modalHeader}>
          <strong>{title}</strong>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={styles.iconButton}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Empty({ label }) {
  return (
    <div style={styles.empty}>
      <GraduationCap size={25} />
      <span>{label}</span>
    </div>
  );
}

function TrendingIcon() {
  return (
    <span style={styles.customIcon}>
      <BarChart3 size={16} />
    </span>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    paddingBottom: '2rem',
    color: '#f4f7ff',
    background:
      'radial-gradient(circle at top,rgba(34,43,68,.58),#07090e 68%)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '.65rem',
    padding: '.75rem',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    background: 'rgba(8,11,18,.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },

  iconButton: {
    width: '2.45rem',
    height: '2.45rem',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.06)',
    cursor: 'pointer',
  },

  heading: {
    display: 'grid',
    gap: '.18rem',
    textAlign: 'center',
  },

  headingSpan: {
    color: '#91a0bc',
    fontSize: '.64rem',
  },

  content: {
    width: 'min(100%, 1120px)',
    margin: '0 auto',
    padding: '.9rem',
    display: 'grid',
    gap: '.8rem',
  },

  notice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    padding: '.65rem',
    border: '1px solid rgba(130,233,193,.22)',
    borderRadius: '.7rem',
    color: '#c7ffe4',
    background: 'rgba(130,233,193,.08)',
    fontSize: '.64rem',
  },

  moduleNav: {
    display: 'flex',
    gap: '.35rem',
    overflowX: 'auto',
    paddingBottom: '.2rem',
  },

  moduleButton: {
    minWidth: '5.9rem',
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.28rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.7rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  activeModuleButton: {
    borderColor: 'rgba(124,92,255,.45)',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.25),rgba(77,215,255,.1))',
  },

  educationHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.9rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.18),rgba(77,215,255,.06))',
    animation:
      'aarush-education-pulse 3s ease-in-out infinite',
  },

  educationOrb: {
    width: '4.8rem',
    height: '4.8rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    border: '1px solid rgba(77,215,255,.4)',
    borderRadius: '1.2rem',
    color: '#c9f9ff',
    background:
      'radial-gradient(circle,#3d6d8a,#262257 70%)',
  },

  educationCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.25rem',
    flex: 1,
  },

  aiBadge: {
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '.3rem .45rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.56rem',
    fontWeight: 800,
  },

  educationCopyH1: {
    margin: '.2rem 0 0',
    fontSize: '1rem',
  },

  educationCopyP: {
    maxWidth: '40rem',
    margin: 0,
    color: '#91a0bc',
    fontSize: '.63rem',
    lineHeight: 1.45,
  },

  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.55rem',
    marginTop: '.25rem',
    color: '#9deeff',
    fontSize: '.57rem',
  },

  heroMetaSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.2rem',
  },

  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.5rem',
  },

  metricCard: {
    minHeight: '6.4rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.9rem',
    background: 'rgba(15,19,30,.9)',
    animation: 'aarush-education-in 240ms ease both',
  },

  metricIcon: {
    width: '1.9rem',
    height: '1.9rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
  },

  metricLabel: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  metricValue: {
    color: '#fff',
    fontSize: '.79rem',
  },

  section: {
    padding: '.9rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '1.1rem',
    background: 'rgba(15,19,30,.9)',
    boxShadow: '0 16px 45px rgba(0,0,0,.18)',
    animation: 'aarush-education-in 240ms ease both',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '.5rem',
    marginBottom: '.7rem',
  },

  sectionHeaderDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  sectionHeaderH2: {
    margin: 0,
    fontSize: '.86rem',
  },

  sectionHeaderSpan: {
    color: '#91a0bc',
    fontSize: '.61rem',
  },

  smallPrimary: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.59rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  smallButton: {
    minHeight: '2.3rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .55rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.58rem',
    cursor: 'pointer',
  },

  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.5rem',
  },

  courseCard: {
    display: 'grid',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '.85rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
  },

  courseImage: {
    width: '100%',
    height: '7rem',
    objectFit: 'cover',
  },

  coursePlaceholder: {
    height: '7rem',
    display: 'grid',
    placeItems: 'center',
    color: '#9deeff',
    background: 'rgba(77,215,255,.08)',
  },

  courseBody: {
    display: 'grid',
    gap: '.25rem',
    padding: '.6rem',
  },

  courseBodySpan: {
    color: '#91a0bc',
    fontSize: '.56rem',
  },

  courseBodySmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  courseButton: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.25rem',
    marginTop: '.15rem',
    border: 0,
    borderRadius: '.55rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.56rem',
    cursor: 'pointer',
  },

  progressTrack: {
    height: '.35rem',
    overflow: 'hidden',
    marginTop: '.2rem',
    borderRadius: '999px',
    background: 'rgba(255,255,255,.09)',
  },

  progressFill: {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background:
      'linear-gradient(90deg,#7c5cff,#4dd7ff)',
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.7rem',
    marginBottom: '.6rem',
    padding: '0 .7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.8rem',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.05)',
  },

  searchInput: {
    minWidth: 0,
    minHeight: '2.55rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.68rem',
  },

  filterRow: {
    display: 'flex',
    gap: '.3rem',
    overflowX: 'auto',
    paddingBottom: '.35rem',
  },

  filterButton: {
    minHeight: '2.1rem',
    flexShrink: 0,
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#91a0bc',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  activeFilterButton: {
    borderColor: 'rgba(124,92,255,.42)',
    color: '#fff',
    background: 'rgba(124,92,255,.16)',
  },

  subjectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: '.45rem',
  },

  subjectCard: {
    display: 'grid',
    justifyItems: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  subjectIcon: {
    width: '2rem',
    height: '2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.55rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  subjectCardSmall: {
    color: '#91a0bc',
    fontSize: '.54rem',
  },

  tutorHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.75rem',
    border: '1px solid rgba(124,92,255,.18)',
    borderRadius: '.8rem',
    color: '#c9f9ff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.12),rgba(77,215,255,.05))',
  },

  tutorHeroDiv: {
    display: 'grid',
    gap: '.2rem',
  },

  tutorHeroSpan: {
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  tutorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
    marginTop: '.7rem',
  },

  tutorAction: {
    minHeight: '2.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.3rem',
    padding: '0 .55rem',
    border: '1px solid rgba(124,92,255,.15)',
    borderRadius: '.7rem',
    color: '#cbd6ec',
    background: 'rgba(124,92,255,.06)',
    fontSize: '.57rem',
    textAlign: 'left',
    cursor: 'pointer',
  },

  tutorComposer: {
    display: 'flex',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.35rem',
    border: '1px solid rgba(77,215,255,.15)',
    borderRadius: '.75rem',
    background: 'rgba(77,215,255,.05)',
  },

  composerInput: {
    minWidth: 0,
    minHeight: '2.35rem',
    flex: 1,
    border: 0,
    outline: 0,
    color: '#fff',
    background: 'transparent',
    fontSize: '.66rem',
  },

  sendButton: {
    width: '2.35rem',
    height: '2.35rem',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: '.6rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    cursor: 'pointer',
  },

  noteTools: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
  },

  toolChip: {
    minHeight: '2.2rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.25rem',
    padding: '0 .5rem',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: '999px',
    color: '#aab6cf',
    background: 'rgba(255,255,255,.04)',
    fontSize: '.55rem',
    cursor: 'pointer',
  },

  noteList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
    marginTop: '.7rem',
  },

  noteCard: {
    minHeight: '8.2rem',
    display: 'grid',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,210,125,.16)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,210,125,.05)',
  },

  noteTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '.25rem',
    color: '#ffd27d',
    fontSize: '.55rem',
  },

  noteCardP: {
    margin: 0,
    color: '#aab6cf',
    fontSize: '.57rem',
    lineHeight: 1.4,
  },

  noteCardSmall: {
    marginTop: 'auto',
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  flashcard: {
    minHeight: '14rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gap: '.45rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.25)',
    borderRadius: '1rem',
    color: '#fff',
    background:
      'linear-gradient(135deg,rgba(124,92,255,.2),rgba(77,215,255,.08))',
    textAlign: 'center',
  },

  flashcardLabel: {
    padding: '.25rem .4rem',
    borderRadius: '999px',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.1)',
    fontSize: '.54rem',
  },

  flashcardStrong: {
    fontSize: '1rem',
  },

  flashcardP: {
    maxWidth: '30rem',
    margin: 0,
    color: '#cbd6ec',
    fontSize: '.65rem',
  },

  flashcardSmall: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  flashcardActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2,1fr)',
    gap: '.4rem',
  },

  primaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.7rem',
    border: 0,
    borderRadius: '999px',
    color: '#fff',
    background:
      'linear-gradient(135deg,#7c5cff,#4dd7ff)',
    fontSize: '.68rem',
    fontWeight: 850,
    cursor: 'pointer',
  },

  secondaryButton: {
    minHeight: '2.7rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.35rem',
    width: '100%',
    marginTop: '.7rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '999px',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.62rem',
    cursor: 'pointer',
  },

  quizList: {
    display: 'grid',
    gap: '.4rem',
  },

  quizRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.6rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    color: '#dce5f8',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  quizIcon: {
    width: '2.3rem',
    height: '2.3rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#9deeff',
    background: 'rgba(77,215,255,.1)',
  },

  quizCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  quizCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  quizCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  questionTypes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  assignmentList: {
    display: 'grid',
    gap: '.4rem',
    marginTop: '.6rem',
  },

  assignmentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.5rem',
    padding: '.55rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.7rem',
    background: 'rgba(255,255,255,.035)',
  },

  assignmentIcon: {
    width: '2.25rem',
    height: '2.25rem',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: '.6rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.1)',
  },

  assignmentCopy: {
    minWidth: 0,
    display: 'grid',
    gap: '.17rem',
    flex: 1,
  },

  assignmentCopySpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  assignmentCopySmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  examList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  examCard: {
    display: 'grid',
    gap: '.25rem',
    padding: '.7rem',
    border: '1px solid rgba(255,210,125,.16)',
    borderRadius: '.75rem',
    color: '#dce5f8',
    background: 'rgba(255,210,125,.05)',
  },

  examIcon: {
    width: '2.2rem',
    height: '2.2rem',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '.6rem',
    color: '#ffd27d',
    background: 'rgba(255,210,125,.12)',
  },

  examCardSpan: {
    color: '#91a0bc',
    fontSize: '.57rem',
  },

  examCardSmall: {
    color: '#6f7d98',
    fontSize: '.53rem',
  },

  examStats: {
    display: 'grid',
    gap: '.2rem',
    marginTop: '.2rem',
    color: '#c9f9ff',
    fontSize: '.55rem',
  },

  plannerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '.45rem',
  },

  plannerCard: {
    minHeight: '5.3rem',
    display: 'grid',
    justifyItems: 'start',
    alignContent: 'start',
    gap: '.25rem',
    padding: '.65rem',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: '.75rem',
    color: '#cbd6ec',
    background: 'rgba(255,255,255,.035)',
    textAlign: 'left',
    cursor: 'pointer',
  },

  plannerCardSpan: {
    color: '#91a0bc',
    fontSize: '.55rem',
  },

  studyPlanNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '.35rem',
    marginTop: '.7rem',
    padding: '.7rem',
    borderRadius: '.7rem',
    color: '#c9f9ff',
    background: 'rgba(77,215,255,.06)',
    fontSize: '.59rem',
  },

  analyticsList: {
    display: 'grid',
    gap: '.35rem',
    marginTop: '.7rem',
  },

  analyticsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    minHeight: '2.5rem',
    padding: '0 .55rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    color: '#91a0bc',
    fontSize: '.59rem',
  },

  analyticsRowStrong: {
    marginLeft: 'auto',
    color: '#c9f9ff',
  },

  customIcon: {
    display: 'grid',
    placeItems: 'center',
  },

  empty: {
    minHeight: '6rem',
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    gridColumn: '1 / -1',
    gap: '.4rem',
    color: '#91a0bc',
    fontSize: '.64rem',
    textAlign: 'center',
  },

  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '.8rem',
    background: 'rgba(2,5,10,.72)',
    backdropFilter: 'blur(10px)',
  },

  modal: {
    width: 'min(100%, 430px)',
    display: 'grid',
    gap: '.7rem',
    padding: '1rem',
    border: '1px solid rgba(124,92,255,.3)',
    borderRadius: '1.2rem',
    background:
      'linear-gradient(180deg,#171d2d,#0e1320)',
    boxShadow: '0 24px 70px rgba(0,0,0,.5)',
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  field: {
    display: 'grid',
    gap: '.3rem',
    color: '#aab6cf',
    fontSize: '.63rem',
  },

  textInput: {
    minHeight: '2.5rem',
    padding: '0 .65rem',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '.7rem',
    outline: 0,
    color: '#fff',
    background: 'rgba(255,255,255,.05)',
    fontSize: '.68rem',
  },
};