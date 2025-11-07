import { Platform } from "react-native";

// ========================================
// API Configuration - Choose based on your setup
// ========================================

// OPTION 1: Auto-detect platform (RECOMMENDED)
const getApiBaseUrl = () => {
  // For Android Emulator
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  }

  // For iOS Simulator / Web
  return "http://127.0.0.1:8000/api";
};

// OPTION 2: Use specific IP for physical device
// Uncomment dan ganti dengan IP komputer Anda
// const getApiBaseUrl = () => "http://192.168.1.100:8000/api"; // Ganti dengan IP Anda

// OPTION 3: Production API
// const getApiBaseUrl = () => "https://your-production-api.com/api";

const API_BASE_URL = getApiBaseUrl();

console.log("🌐 API Base URL:", API_BASE_URL);

export interface ApiPerson {
  id: number;
  name: string;
  age: number;
  location: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  dislikes_count: number;
  photos?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// Laravel API Response Format
interface LaravelApiResponse {
  status: string;
  message: string;
  data: {
    people: Array<{
      id: number;
      name: string;
      age: number;
      location: string;
      image_url: string;
      created_at: string;
      updated_at: string;
      likes_count: number;
      dislikes_count: number;
    }>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
      has_more_pages: boolean;
      next_page_url: string | null;
      prev_page_url: string | null;
    };
  };
}

// Optimized fetch function with better error handling and performance
export async function fetchRecommendedPeople(
  page: number = 1,
  perPage: number = 5,
  signal?: AbortSignal // Support untuk cancellation dari React Query
): Promise<PaginatedResponse<ApiPerson>> {
  try {
    const url = new URL(`${API_BASE_URL}/people/recommended`);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString(), {
      signal, // Gunakan signal dari React Query untuk auto-cancellation
      headers: {
        "Content-Type": "application/json",
        // Tambahkan cache headers untuk optimasi
        "Cache-Control": "no-cache",
      },
      // Untuk production, bisa enable credentials jika perlu auth
      // credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: LaravelApiResponse = await response.json();

    // Validate response structure
    if (
      !apiResponse ||
      !apiResponse.data ||
      !Array.isArray(apiResponse.data.people)
    ) {
      throw new Error("Invalid response format from API");
    }

    // Transform Laravel response to our expected format
    const transformedData: PaginatedResponse<ApiPerson> = {
      data: apiResponse.data.people.map((person) => ({
        // Core fields from API
        id: person.id,
        name: person.name,
        age: person.age,
        location: person.location,
        image_url: person.image_url,
        created_at: person.created_at,
        updated_at: person.updated_at,
        likes_count: person.likes_count,
        dislikes_count: person.dislikes_count,
        photos: [person.image_url], // Convert single image to array
      })),
      current_page: apiResponse.data.pagination.current_page,
      per_page: apiResponse.data.pagination.per_page,
      total: apiResponse.data.pagination.total,
      last_page: apiResponse.data.pagination.last_page,
    };

    return transformedData;
  } catch (error) {
    // Jangan fallback ke mock data di production
    // Hanya log error dan throw ulang untuk ditangani React Query
    if (error instanceof Error && error.name === "AbortError") {
      // Request dibatalkan, ini normal behavior
      throw error;
    }

    console.error("Error fetching recommended people:", error);
    throw error; // Let React Query handle retry logic
  }
}

// Helper function untuk prefetch page berikutnya
export async function prefetchNextPage(
  page: number,
  perPage: number
): Promise<PaginatedResponse<ApiPerson>> {
  return fetchRecommendedPeople(page, perPage);
}
