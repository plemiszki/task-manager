class ScrapeStreetEasy

  PROPERTY_TYPE_MAP = {
    'condo'                => 'condo',
    'co-op'                => 'co-op',
    'coop'                 => 'co-op',
    'townhouse'            => 'townhouse',
    'single family house'  => 'single-family-house',
    'single-family house'  => 'single-family-house',
    'single family'        => 'single-family-house',
    'single-family'        => 'single-family-house',
    'singlefamily'         => 'single-family-house',
    'multi family house'   => 'multi-family-house',
    'multi-family house'   => 'multi-family-house',
    'multi family'         => 'multi-family-house',
    'multi-family'         => 'multi-family-house',
    'multifamily'          => 'multi-family-house',
    'two family house'     => 'double-family-house',
    'two-family house'     => 'double-family-house',
    'two family'           => 'double-family-house',
    'two-family'           => 'double-family-house',
    'double family house'  => 'double-family-house',
    'double-family house'  => 'double-family-house',
    'double family'        => 'double-family-house',
    'double-family'        => 'double-family-house',
  }.freeze

  def initialize(url)
    @url = url
  end

  def call
    response = HTTParty.get(@url, headers: {
      'User-Agent'      => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language' => 'en-US,en;q=0.9',
    })

    doc = Nokogiri::HTML(response.body)
    payload = assemble_flight_payload(doc)

    schema = extract_schema(payload)
    raise 'Could not find listing data on page' unless schema

    build_attributes(schema, payload, doc)
  end

  private

  def assemble_flight_payload(doc)
    doc.css('script').each_with_object(+'') do |script, acc|
      next unless script.text.include?('__next_f.push([1,')
      match = script.text.match(/push\(\[1,("(?:[^"\\]|\\.)*")\]\)/)
      next unless match
      begin
        acc << JSON.parse(match[1])
      rescue JSON::ParserError
        # skip malformed chunks
      end
    end
  end

  def extract_schema(payload)
    start = payload.index('{"@context":"https://schema.org","@type":"')
    return nil unless start

    extract_json_object(payload, start)
  end

  def extract_json_object(str, start)
    depth = 0
    i = start
    in_string = false
    escape_next = false

    while i < str.length
      ch = str[i]

      if escape_next
        escape_next = false
      elsif ch == '\\'
        escape_next = true
      elsif ch == '"'
        in_string = !in_string
      elsif !in_string
        case ch
        when '{' then depth += 1
        when '}'
          depth -= 1
          return JSON.parse(str[start..i]) if depth == 0
        end
      end

      i += 1
    end
    nil
  rescue JSON::ParserError
    nil
  end

  def build_attributes(schema, payload, doc)
    # address is a plain string in the schema
    street = schema['address'].to_s.strip

    apt_match  = street.match(/,?\s+(Apt|Unit|#)\s*(.+)$/i)
    apt_number = apt_match&.[](2)
    street_address = apt_match ? street[0, apt_match.begin(0)].strip : street

    label = street_address
    label = "#{label}, #{apt_number}" if apt_number

    neighborhood  = extract_neighborhood_from_doc(doc)

    price     = extract_field(payload, 'price') ||
                extract_field(payload, 'askingPrice')
    bedrooms  = extract_bedrooms_from_doc(doc)
    full_bathrooms = extract_field(payload, 'fullBaths') ||
                     extract_field(payload, 'fullBathrooms')
    half_bathrooms = extract_field(payload, 'halfBaths') ||
                     extract_field(payload, 'halfBathrooms')
    area      = extract_field(payload, 'squareFeet') ||
                extract_field(payload, 'size')
    taxes     = extract_field(payload, 'monthlyTaxes')
    hoa_fees  = extract_field(payload, 'maintenanceFee') ||
                extract_field(payload, 'commonCharges')

    property_type = extract_type_from_doc(doc)
    image_url     = doc.at_css('[class*="MediaCarousel_mediaCarouselSlide"] img')&.attr('src')

    {
      label:          label,
      street_address: street_address,
      apt_number:     apt_number,
      neighborhood:   neighborhood,
      status:         'available',
      price:          price.to_i,
      bedrooms:       bedrooms,
      full_bathrooms: full_bathrooms.to_i,
      half_bathrooms: half_bathrooms.to_i,
      property_type:  property_type,
      image_url:      image_url,
      area:           area&.to_i,
      taxes:          taxes&.to_f,
      hoa_fees:       hoa_fees&.to_f,
      url:            @url,
    }
  end

  def extract_bedrooms_from_doc(doc)
    doc.css('p').each do |p|
      match = p.text.strip.match(/^(\d+)\s+beds?$/i)
      return match[1].to_i if match
    end
    nil
  end

  def extract_field(payload, field)
    match = payload.match(/"#{Regexp.escape(field)}":\s*([\d.]+)/)
    match&.[](1)
  end

  def extract_string_field(payload, field)
    match = payload.match(/"#{Regexp.escape(field)}"\s*:\s*"([^"]+)"/)
    match&.[](1)&.strip&.presence
  end

  def extract_neighborhood_from_doc(doc)
    info_item = doc.at_css('[class*="AboutBuildingSection_infoItem"]')
    return nil unless info_item

    spans = info_item.css('span')
    # Second span contains "&nbsp; Neighborhood Name"
    spans[1]&.text&.gsub(/[[:space:]]/, ' ')&.strip&.presence
  end

  def extract_type_from_doc(doc)
    info_item = doc.at_css('[class*="AboutBuildingSection_infoItem"]')
    return nil unless info_item

    # First span: "Single-family house in"
    raw = info_item.css('span').first&.text&.gsub(/\s+in\s*$/i, '')&.strip&.downcase
    return nil unless raw

    PROPERTY_TYPE_MAP[raw] || PROPERTY_TYPE_MAP[raw.gsub(/\s+/, '')]
  end

end
