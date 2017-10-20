bash "install ondrej" do
  code <<-EOS
  apt-get install -y python-software-properties
  add-apt-repository -y ppa:ondrej/php
  apt-get update -y
  EOS
end

%W{
  php7.1
  php7.1-curl
  php7.1-mbstring
  php7.1-dom
  php7.1-apcu
  php7.1-redis
  php7.1-memcached
  php7.1-oauth
}.each do |pkg|
  package pkg do
    action :install
  end
end

bash "install composer" do
  code <<-EOS
  php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
  php composer-setup.php --install-dir=/usr/local/bin --filename=composer
  composer global require hirak/prestissimo
  EOS
end

