import toast from 'react-hot-toast';
// import { toast } from "sonner"

interface NotifyOptions {
  message: string;
  type?: 'success' | 'error';
}
interface Availability {
  [key: string]: string[];
}

// export const slugify = (text: string) => {
//     return text
//       .toLowerCase() // Convert to lowercase
//       .replace(/&/g, "and") // Replace '&' with 'and'
//       .replace(/\s+/g, "-") // Replace spaces with '-'
//       .replace(/[^\w-]+/g, ""); // Remove all non-word characters
//   };
  
//   export const deslugify = (slug: string) => {
//     return slug
//       .replace(/-/g, " ") // Replace '-' with spaces
//       .replace(/\band\b/g, "&") // Replace 'and' with '&'
//       .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize words
//   };
  


 

// export const generateSlug = (name: string) => {
//   return name
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
//     .replace(/\s+/g, '-'); // Replace spaces with hyphens
// };

export const notify = ({ message, type = 'success' }: NotifyOptions): void => {
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  }
};

// export const getFormattedDate = (date: string) => {
//   const dateNew = new Date(date);

//   const mm = String(dateNew.getMonth() + 1).padStart(2, '0'); // Month (01-12)
//   const dd = String(dateNew.getDate()).padStart(2, '0'); // Day (01-31)
//   const yyyy = dateNew.getFullYear(); // Year (2026)

//   const formattedDate = `${dd}/${mm}/${yyyy}`;
//   return formattedDate 
// };

 export const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  

  export   const formatAvailability = (availability: Availability) => {
    return Object.entries(availability).map(([day, times]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      times: times.join(", "),
    }));
  };
