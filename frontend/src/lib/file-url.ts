export function getDownloadUrl(url: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  if (url.includes("/upload/fl_attachment/")) {
    return url;
  }

  const isLegacyCloudinaryDocument =
    url.includes("/image/upload/") &&
    /\.(pdf|doc|docx|xls|xlsx|txt|zip)(\?|$)/i.test(url);

  if (isLegacyCloudinaryDocument) {
    return url;
  }

  return url.replace("/upload/", "/upload/fl_attachment/");
}
