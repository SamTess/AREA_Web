#!/bin/bash

echo "🚀 Running AREA Web Test Suite with Coverage Report"
echo "=================================================="
echo ""

npm test -- --coverage --passWithNoTests --silent

echo ""
echo "📊 Coverage Summary:"
echo "==================="

echo ""
echo "📊 Coverage Summary:"
echo "==================="

if [ -f "coverage/lcov-report/index.html" ]; then
        echo "📈 Overall Coverage:"
        statements_pct=$(perl -0777 -ne 'if (/<span class="strong">\s*([0-9.]+)%\s*<\/span>\s*<span class="quiet">\s*Statements\s*<\/span>/) { print $1 }' coverage/lcov-report/index.html)
        statements_frac=$(perl -0777 -ne 'if (/<span class="quiet">\s*Statements\s*<\/span>\s*<span class='\''fraction'\''>\s*([^<]+)\s*<\/span>/) { print $1 }' coverage/lcov-report/index.html)
        branches_pct=$(perl -0777 -ne 'if (/<span class="strong">\s*([0-9.]+)%\s*<\/span>\s*<span class="quiet">\s*Branches\s*<\/span>/) { print $1 }' coverage/lcov-report/index.html)
        branches_frac=$(perl -0777 -ne 'if (/<span class="quiet">\s*Branches\s*<\/span>\s*<span class='\''fraction'\''>\s*([^<]+)\s*<\/span>/) { print $1 }' coverage/lcov-report/index.html)
        functions_pct=$(perl -0777 -ne 'if (/<span class="strong">\s*([0-9.]+)%\s*<\/span>\s*<span class="quiet">\s*Functions\s*<\/span>/) { print $1 }' coverage/lcov-report/index.html)
        functions_frac=$(perl -0777 -ne 'if (/<span class="quiet">\s*Functions\s*<\/span>\s*<span class='\''fraction'\''>\s*([^<]+)\s*<\/span>/) { print $1 }' coverage/lcov-report/index.html)
        lines_pct=$(perl -0777 -ne 'if (/<span class="strong">\s*([0-9.]+)%\s*<\/span>\s*<span class="quiet">\s*Lines\s*<\/span>/) { print $1 }' coverage/lcov-report/index.html)
        lines_frac=$(perl -0777 -ne 'if (/<span class="quiet">\s*Lines\s*<\/span>\s*<span class='\''fraction'\''>\s*([^<]+)\s*<\/span>/) { print $1 }' coverage/lcov-report/index.html)
        echo "  Statements: ${statements_pct}% (${statements_frac})"
        echo "  Branches: ${branches_pct}% (${branches_frac})"
        echo "  Functions: ${functions_pct}% (${functions_frac})"
        echo "  Lines: ${lines_pct}% (${lines_frac})"

        echo ""
        echo "🎯 Components with 100% Coverage:"

        perl -0777 -ne '
            my $html = $_;
            while ($html =~ /<tr>(.*?)<\/tr>/sg) {
                my $row = $1;
                my ($file) = $row =~ /<td class="file[^"]*"[^>]*>(.*?)<\/td>/s;
                next unless defined $file;
                # Extract text from anchor tag if present
                $file =~ s/<a[^>]*>(.*?)<\/a>/$1/s;
                $file =~ s/^\s+|\s+$//g;
                next if $file eq "File"; # Skip header

                my @pcts = ($row =~ /<td[^>]*class="pct[^"]*"[^>]*>\s*([0-9.]+)%\s*<\/td>/g);
                next unless scalar(@pcts) >= 4;
                if ($pcts[0] == 100 && $pcts[1] == 100 && $pcts[2] == 100 && $pcts[3] == 100) {
                    print "  ✅ $file\n";
                }
            }
        ' coverage/lcov-report/index.html | sort | uniq

        echo ""
        echo "📋 Components with 0% Statements Coverage (Priority for testing):"

        perl -0777 -ne '
            my $html = $_;
            while ($html =~ /<tr>(.*?)<\/tr>/sg) {
                my $row = $1;
                my ($file) = $row =~ /<td class="file[^"]*"[^>]*>(.*?)<\/td>/s;
                next unless defined $file;
                # Extract text from anchor tag if present
                $file =~ s/<a[^>]*>(.*?)<\/a>/$1/s;
                $file =~ s/^\s+|\s+$//g;
                next if $file eq "File"; # Skip header

                my @pcts = ($row =~ /<td[^>]*class="pct[^"]*"[^>]*>\s*([0-9.]+)%\s*<\/td>/g);
                if (scalar(@pcts) >= 1 && $pcts[0] == 0) {
                    print "  🎯 $file\n";
                }
            }
        ' coverage/lcov-report/index.html | sort | uniq

else
        echo "Coverage report not found. Make sure tests ran successfully."
fi

echo ""
echo "📁 Coverage Report Locations:"
echo "  HTML Report: coverage/lcov-report/index.html"
echo "  JSON Data: coverage/coverage-summary.json"
echo "  LCOV File: coverage/lcov.info"