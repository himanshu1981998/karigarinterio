def get_media_url(field_file, request=None):
    if not field_file:
        return None

    try:
        url = field_file.url
    except ValueError:
        return None

    if request and not url.startswith(("http://", "https://")):
        return request.build_absolute_uri(url)

    return url
