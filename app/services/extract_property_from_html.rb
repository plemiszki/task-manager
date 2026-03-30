class ExtractPropertyFromHtml

  API_URL = 'https://api.anthropic.com/v1/messages'.freeze
  MODEL   = 'claude-haiku-4-5-20251001'.freeze

  PROMPT = <<~PROMPT
    You are a data extraction assistant. Extract property listing details from the following StreetEasy HTML and return ONLY a valid JSON object with no explanation or markdown.

    Required fields (use null for any that are missing or unclear):
    - label: street address with apt number if present (e.g. "314 Sherman Street" or "123 Main St, Apt 4B")
    - street_address: street address without apt number (e.g. "314 Sherman Street")
    - apt_number: apartment/unit number only, or null
    - neighborhood: neighborhood name (e.g. "Windsor Terrace")
    - price: integer (dollars, no $ or commas, e.g. 1250000)
    - bedrooms: integer
    - full_bathrooms: integer
    - half_bathrooms: integer
    - property_type: one of exactly: "townhouse", "condo", "co-op", "single-family-house", "double-family-house", "multi-family-house"
    - area: integer square footage or null
    - taxes: float monthly taxes or null
    - hoa_fees: float monthly HOA/maintenance fees or null
    - image_url: URL of the first listing photo or null

    Return only the JSON object, nothing else.
  PROMPT

  def initialize(html, url)
    @html = html
    @url  = url
  end

  def call
    doc = Nokogiri::HTML(@html)
    image_url = doc.at_css('[class*="MediaCarousel_mediaCarouselSlide"] img')&.attr('src')
    doc.css('script, style, nav, footer, header').remove

    # Target the sections most likely to contain listing data
    selectors = [
      '[class*="About"]',
      '[class*="Price"]',
      '[class*="price"]',
      '[class*="Details"]',
      '[class*="Building"]',
      '[class*="Listing"]',
      '[class*="Summary"]',
      '[class*="Amenities"]',
      'main',
    ]
    nodes = selectors.flat_map { |s| doc.css(s).to_a }.uniq
    page_text = if nodes.any?
      nodes.map { |n| n.text.gsub(/[[:space:]]+/, ' ').strip }.join("\n")
    else
      doc.text.gsub(/[[:space:]]+/, ' ').strip
    end
    page_text = page_text[0, 15_000]

    response = HTTParty.post(API_URL,
      headers: {
        'x-api-key'         => ENV.fetch('ANTHROPIC_API_KEY'),
        'anthropic-version' => '2023-06-01',
        'content-type'      => 'application/json',
      },
      body: {
        model:      MODEL,
        max_tokens: 1024,
        messages:   [
          {
            role:    'user',
            content: "#{PROMPT}\n\nPage text:\n#{page_text}",
          },
        ],
      }.to_json,
    )

    raise "Claude API error: #{response.code} — #{response.body}" unless response.code == 200

    text = response.parsed_response.dig('content', 0, 'text')
    raise 'No response text from Claude' unless text

    text = text.gsub(/\A```(?:json)?\n?/, '').gsub(/\n?```\z/, '').strip
    data = JSON.parse(text)

    {
      label:          data['label'],
      street_address: data['street_address'],
      apt_number:     data['apt_number'],
      neighborhood:   data['neighborhood'],
      status:         'available',
      price:          data['price'].to_i,
      bedrooms:       data['bedrooms'],
      full_bathrooms: data['full_bathrooms'].to_i,
      half_bathrooms: data['half_bathrooms'].to_i,
      property_type:  data['property_type'],
      image_url:      image_url || data['image_url'],
      area:           data['area']&.to_i,
      taxes:          data['taxes']&.to_f,
      hoa_fees:       data['hoa_fees']&.to_f,
      url:            @url,
    }
  end

end
