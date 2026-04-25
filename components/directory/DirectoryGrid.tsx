"use client"

// Import React hooks for managing local state and side effects
import { useState, useEffect, useCallback } from "react"
// Import Link for routing to member profiles
import Link from "next/link"
// Import Lucide icons for visual enhancements
import { Search, Filter, Loader2, Target, ChevronLeft, ChevronRight } from "lucide-react"
// Import the server actions to fetch data
import { getDirectoryMembers, getDirectoryTags } from "@/lib/actions/directory.actions"

// Define the interface for the Tag object
interface Tag {
  // Unique identifier for the tag
  id: string
  // Display label for the tag
  label: string
}

// Define the interface for a Goal inside a Member
interface Goal {
  // Unique identifier
  id: string
  // Goal title
  title: string
}

// Define the interface for the Member object returned by the query
interface Member {
  // Unique identifier
  id: string
  // Full name
  name: string
  // URL friendly slug
  slug: string
  // Short biography
  bio: string | null
  // URL to their avatar image
  avatar_url: string | null
  // Boolean flag if they are in the SEC
  is_sec: boolean
  // SEC role title
  sec_role: string | null
  // Array of associated goals
  goals: Goal[]
  // Array of associated tags
  tags: Tag[]
}

// Export the default Client Component for the grid
export default function DirectoryGrid() {
  // State to hold the fetched members
  const [members, setMembers] = useState<Member[]>([])
  // State to hold all available tags for the filter
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  
  // State for the current search text input
  const [searchTerm, setSearchTerm] = useState("")
  // State for the debounced search text to prevent excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState("")
  // State for the currently selected tag IDs
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // State for current pagination page
  const [page, setPage] = useState(1)
  // State for total number of items available
  const [totalCount, setTotalCount] = useState(0)
  // Constant for items per page
  const LIMIT = 12
  
  // State to track if data is currently loading
  const [isLoading, setIsLoading] = useState(true)

  // Effect to load available tags once on mount
  useEffect(() => {
    // Define async helper
    const fetchTags = async () => {
      // Call server action
      const { data } = await getDirectoryTags()
      // If data exists, set it
      if (data) setAvailableTags(data)
    // End helper
    }
    // Execute helper
    fetchTags()
  // Run only once on mount
  }, [])

  // Effect to handle debouncing the search input
  useEffect(() => {
    // Set a timeout to update the debounced value after 500ms
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    // Cleanup function to clear the timeout if input changes before 500ms
    return () => clearTimeout(timer)
  // Re-run whenever searchTerm changes
  }, [searchTerm])

  // Effect to fetch members whenever filters or page changes
  useEffect(() => {
    // Define async helper
    const fetchMembers = async () => {
      // Set loading to true
      setIsLoading(true)
      // Call server action with current state parameters
      const { data, count, error } = await getDirectoryMembers({
        // Pass debounced search
        search: debouncedSearch,
        // Pass selected tags array
        tagIds: selectedTags,
        // Pass current page
        page,
        // Pass limit constant
        limit: LIMIT
      // End parameters
      })
      
      // If data was returned successfully
      if (data) {
        // Cast the returned data to our Member[] type (since supabase returns generic nested types)
        setMembers(data as unknown as Member[])
        // Set the total count for pagination math
        setTotalCount(count || 0)
      // End if
      }
      // Turn off loading state
      setIsLoading(false)
    // End helper
    }
    
    // Execute the fetch
    fetchMembers()
  // Re-run when dependencies change
  }, [debouncedSearch, selectedTags, page])

  // Handler to toggle a tag's selection status
  const toggleTag = (tagId: string) => {
    // Update the state based on previous state
    setSelectedTags(prev => 
      // If it's already selected, filter it out. Otherwise, add it.
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
    // Reset to page 1 when changing filters
    setPage(1)
  // End toggleTag
  }

  // Calculate total pages for pagination UI
  const totalPages = Math.ceil(totalCount / LIMIT)

  // Return the JSX interface
  return (
    // Main container
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 animate-fade-in">
        
        {/* Search Section */}
        <div className="space-y-3">
          {/* Label */}
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-brand-500" />
            Search
          </h3>
          {/* Input Wrapper */}
          <div className="relative">
            {/* The actual input field */}
            <input
              type="text"
              placeholder="Name, bio, or goal..."
              // Bind value to state
              value={searchTerm}
              // Update state on change
              onChange={(e) => {
                setSearchTerm(e.target.value)
                // Reset page to 1 when user types
                setPage(1)
              }}
              // Premium styling classes
              className="w-full pl-4 pr-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none transition-all placeholder:text-foreground/40"
            />
          {/* End Input Wrapper */}
          </div>
        {/* End Search Section */}
        </div>

        {/* Tags Filter Section */}
        <div className="space-y-3">
          {/* Label */}
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-brand-500" />
            Filter by Tags
          </h3>
          {/* Tags Container */}
          <div className="flex flex-wrap gap-2">
            {/* Map over available tags */}
            {availableTags.map(tag => (
              // Individual tag button
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                // Dynamic styling based on whether it is selected or not
                className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-300 ${
                  selectedTags.includes(tag.id)
                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20"
                    : "bg-surface border-border text-foreground/70 hover:border-brand-300 hover:text-foreground"
                }`}
              >
                {/* Render label */}
                {tag.label}
              {/* End tag button */}
              </button>
            // End map
            ))}
          {/* End Tags Container */}
          </div>
        {/* End Tags Filter Section */}
        </div>
        
      {/* End Sidebar */}
      </aside>

      {/* Main Grid Area */}
      <div className="flex-grow min-h-[500px] flex flex-col">
        
        {/* Loading State Overlay */}
        {isLoading ? (
          // Centered loader container
          <div className="flex-grow flex items-center justify-center">
            {/* Spinning loader icon */}
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          {/* End loader container */}
          </div>
        // Check if there are no members found
        ) : members.length === 0 ? (
          // Empty state container
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 glass-panel rounded-2xl">
            {/* Empty state icon */}
            <Target className="w-12 h-12 text-foreground/20 mb-4" />
            {/* Empty state title */}
            <h3 className="text-xl font-bold mb-2">No members found</h3>
            {/* Empty state description */}
            <p className="text-foreground/60">Try adjusting your search terms or clearing your filters.</p>
          {/* End Empty state */}
          </div>
        // Otherwise, render the grid
        ) : (
          // Grid Fragment
          <>
            {/* The CSS Grid container */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
              {/* Map over each member to render a card */}
              {members.map(member => (
                // Link wrapping the entire card
                <Link key={member.id} href={`/directory/members/${member.slug}`} className="group block">
                  {/* The Card container */}
                  <div className="glass-panel p-6 rounded-2xl h-full flex flex-col hover:border-brand-300 hover:-translate-y-1 transition-all duration-300">
                    
                    {/* Card Header (Avatar + Name) */}
                    <div className="flex items-center gap-4 mb-4">
                      {/* Avatar placeholder or image */}
                      <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl flex-shrink-0 overflow-hidden border border-brand-200">
                        {/* If avatar URL exists, render img, else fallback to initials */}
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      {/* End Avatar */}
                      </div>
                      
                      {/* Name and SEC badge container */}
                      <div>
                        {/* Member Name */}
                        <h4 className="font-bold text-lg leading-tight group-hover:text-brand-500 transition-colors">{member.name}</h4>
                        {/* Conditional SEC Badge */}
                        {member.is_sec && (
                          <span className="text-[10px] font-bold tracking-wider text-purple-600 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full inline-block mt-1">
                            {member.sec_role?.replace(/_/g, ' ').toUpperCase() || 'SEC MEMBER'}
                          </span>
                        )}
                      {/* End Name container */}
                      </div>
                    {/* End Card Header */}
                    </div>

                    {/* Bio Snippet */}
                    {member.bio && (
                      // Truncated bio text
                      <p className="text-sm text-foreground/70 line-clamp-2 mb-4 flex-grow">
                        {member.bio}
                      </p>
                    )}

                    {/* Top Goal Preview */}
                    {member.goals && member.goals.length > 0 && (
                      // Goal container
                      <div className="bg-surface border border-border p-3 rounded-xl mb-4">
                        {/* Goal label */}
                        <div className="text-xs font-semibold text-brand-600 mb-1 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Top Goal
                        </div>
                        {/* Goal title truncated */}
                        <p className="text-sm font-medium line-clamp-1">{member.goals[0].title}</p>
                      {/* End Goal container */}
                      </div>
                    )}

                    {/* Tags Container */}
                    <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-border/50">
                      {/* Map up to 3 tags to not overflow the card visually */}
                      {member.tags?.slice(0, 3).map(tag => (
                        <span key={tag.id} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-surface-hover rounded-md text-foreground/60">
                          {tag.label}
                        </span>
                      ))}
                      {/* If more than 3 tags, show a +X indicator */}
                      {member.tags && member.tags.length > 3 && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-surface-hover rounded-md text-foreground/60">
                          +{member.tags.length - 3}
                        </span>
                      )}
                    {/* End Tags Container */}
                    </div>

                  {/* End Card container */}
                  </div>
                {/* End Link */}
                </Link>
              // End map callback
              ))}
            {/* End CSS Grid container */}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              // Pagination Wrapper
              <div className="flex items-center justify-center gap-4 mt-12">
                {/* Previous Button */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-full glass-panel hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {/* Page Indicator */}
                <span className="text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
                {/* Next Button */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-full glass-panel hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              {/* End Pagination Wrapper */}
              </div>
            )}
          {/* End Grid Fragment */}
          </>
        // End condition
        )}

      {/* End Main Grid Area */}
      </div>

    {/* End container */}
    </div>
  // End return
  )
// End DirectoryGrid component
}
