<?php

namespace LizmapWPS\WPS;

class StyleFile
{
    private $fileName;

    private $sha1;

    public function __construct(string $fileName)
    {
        $this->fileName = $fileName;
        $this->sha1 = sha1($fileName);
    }

    public function fileName()
    {
        return $this->fileName;
    }

    public function uniqueID()
    {
        return $this->sha1;
    }
}
