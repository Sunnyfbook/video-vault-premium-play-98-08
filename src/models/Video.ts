export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  dateAdded: string;
  views: number;
}

// Mock data store until we connect to a database
export const videos: Video[] = [
  {
    id: '1',
    title: 'Sample Video 1',
    description: 'This is a sample video description.',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail: 'https://picsum.photos/seed/video1/640/360',
    dateAdded: new Date().toISOString(),
    views: 0
  },
  {
    id: '2',
    title: 'Sample Video 2',
    description: 'This is another sample video for testing.',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail: 'https://picsum.photos/seed/video2/640/360',
    dateAdded: new Date().toISOString(),
    views: 0
  },
  {
    id: '3',
    title: 'Sample Video 3',
    description: 'Third sample video with different content.',
    url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail: 'https://picsum.photos/seed/video3/640/360',
    dateAdded: new Date().toISOString(),
    views: 0
  }
];

// Video service functions
export const getVideos = (): Video[] => {
  try {
    const storedVideos = localStorage.getItem('videos');
    if (storedVideos) {
      return JSON.parse(storedVideos);
    }
    // Initialize with mock data if nothing exists
    localStorage.setItem('videos', JSON.stringify(videos));
    return videos;
  } catch (error) {
    console.error("Error loading videos from localStorage:", error);
    // Return default videos as fallback
    localStorage.setItem('videos', JSON.stringify(videos));
    return videos;
  }
};

export const getVideoById = (id: string): Video | undefined => {
  try {
    if (!id) return undefined;
    
    const videos = getVideos();
    return videos.find(video => video.id === id);
  } catch (error) {
    console.error(`Error finding video with id ${id}:`, error);
    return undefined;
  }
};

export const addVideo = (video: Omit<Video, 'id' | 'dateAdded' | 'views'>): Video => {
  try {
    const videos = getVideos();
    const newVideo: Video = {
      ...video,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      views: 0
    };
    
    videos.push(newVideo);
    localStorage.setItem('videos', JSON.stringify(videos));
    return newVideo;
  } catch (error) {
    console.error("Error adding video:", error);
    throw new Error("Failed to add video");
  }
};

export const updateVideo = (updatedVideo: Video): Video | undefined => {
  try {
    const videos = getVideos();
    const index = videos.findIndex(v => v.id === updatedVideo.id);
    
    if (index !== -1) {
      videos[index] = updatedVideo;
      localStorage.setItem('videos', JSON.stringify(videos));
      return updatedVideo;
    }
    
    return undefined;
  } catch (error) {
    console.error("Error updating video:", error);
    return undefined;
  }
};

export const deleteVideo = (id: string): boolean => {
  try {
    const videos = getVideos();
    const filteredVideos = videos.filter(v => v.id !== id);
    
    if (filteredVideos.length < videos.length) {
      localStorage.setItem('videos', JSON.stringify(filteredVideos));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error deleting video:", error);
    return false;
  }
};

export const incrementViews = (id: string): void => {
  try {
    const videos = getVideos();
    const video = videos.find(v => v.id === id);
    
    if (video) {
      video.views += 1;
      localStorage.setItem('videos', JSON.stringify(videos));
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};

// Function to reset videos to default mock data (useful for debugging)
export const resetVideosToDefault = (): void => {
  try {
    localStorage.setItem('videos', JSON.stringify(videos));
    console.log("Videos reset to default mock data");
  } catch (error) {
    console.error("Error resetting videos:", error);
  }
};
