STRENGTH = 2048
SERIAL = 0
DAYS = 365
SUBJECT = "/C=JP/CN=localhost"
CRT_FILE = "/etc/ssl/certs/localhost.crt"
KEY_FILE = "/etc/ssl/private/localhost.key"
CRT_AND_KEY_FILE = "/etc/ssl/private/localhost.crt_and_key"

%W{
  apache2
  libapache2-mod-php7.1
  openssl
}.each do |pkg|
  package pkg do
    action :install
  end
end

bash "create_self_signed_cerficiate" do
  code <<-EOS
  openssl req -new -newkey rsa:#{STRENGTH} -sha1 -x509 -nodes \
    -set_serial #{SERIAL} \
    -days #{DAYS} \
    -subj "#{SUBJECT}" \
    -out "#{CRT_FILE}" \
    -keyout "#{KEY_FILE}"
  cat "#{CRT_FILE}" "#{KEY_FILE}" >> "#{CRT_AND_KEY_FILE}"
  chmod 400 "#{KEY_FILE}" "#{CRT_AND_KEY_FILE}"
  EOS

  creates CRT_AND_KEY_FILE
end

cookbook_file '/etc/apache2/sites-available/000-default.conf' do
  source '000-default.conf'
  action :create
end

bash 'enable modules and reload apache' do
  code <<-EOS
  a2enmod rewrite
  a2enmod ssl
  service apache2 reload
  EOS
end
