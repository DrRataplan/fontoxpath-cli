module namespace cli = "fontoxpath-cli";

declare %private function cli:array-contains ($arr, $what) {
	array:fold-left($arr, false(), function ($prev, $item) { $prev or $item = $what })
};

declare %private function cli:arg ($args, $flag) {
	let $index := ((1 to array:size($args))[$args(.) = $flag], -1)[1] + 1
	return if ($index = 0) then () else $args($index)
};

declare %public function cli:run ($args as array(*)) as xs:string {
	if (cli:array-contains($args, '--help')) then
		(
			"Usage: fontoxpath-cli [-e script | script.xq]"
		) => string-join("&#10;")
	else
		let $inputFileName := cli:arg($args, '--input'),
			$script := cli:arg($args, '-e'),
			(: Fall back to the file argument :)
			$script := if ($script) then $script else cli:load-file($args(array:size($args))),

			(: Run it :)
			$result := Q{http://fontoxml.com/fontoxpath}evaluate(
					$script,
					map {
						".": $inputFileName!cli:doc(.)
					}
				)
			return
				if ($result instance of node()) then
					cli:serialize-xml($result)
				else
					$result => string()
};